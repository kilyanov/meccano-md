import React, {Component} from 'react';
import AsyncCreatable from "react-select/async-creatable";
import {ReactSelectStyles} from "../../../constants/ReactSelectStyles";
import {connect} from "react-redux";
import {EVENTS, THEME_TYPE} from "../../../constants";
import BEMHelper from "react-bem-helper";
import {EventEmitter} from "../../../helpers";

const cls = new BEMHelper('select');

class AsyncCreatableSelect extends Component {
    state = {
        loadedOptions: [],
        currentOption: {},
        isError: false
    }

    componentDidMount() {
        const { required, requestService, selected } = this.props;

        if (required) {
            EventEmitter.on(EVENTS.FORM.ON_VALIDATE, this.validate);
        }

        if (requestService) {
            this.getOptions();

            if (selected) {
                requestService({'query[id]': selected}).then(({ data }) => {
                    if (data && data.length) {
                        const { name, id } = data[0];

                        this.setState({currentOption: { label: name, value: id }});
                    }
                });
            }
        }
    }

    handleSelect = (option) => {
        this.props.onChange(option);
        this.setState({
            currentOption: option,
            isError: false
        });
    };

    handleBlur = () => {
        if (!this.state.currentOption) {
            this.getOptions();
        }
    };

    getOptions = (inputValue = '', callback = () => {}) => {
        const { requestService, requestCancelService, extendRequestForm } = this.props;
        let form = {};

        if (requestCancelService) {
            requestCancelService();
        }

        if (inputValue) {
            form['query[name]'] = inputValue;
        }

        if (extendRequestForm) {
            form = { ...form, ...extendRequestForm };
        }

        return requestService(form).then(({ data }) => {
            const opt = data.map(option => ({
                label: _.get(option, 'name'),
                value: _.get(option, 'id')
            }));

            this.setState({loadedOptions: opt});
            callback(opt);
            return opt;
        });
    };

    validate = () => {
        const { required } = this.props;
        const { currentOption } = this.state;
        const invalid = required && !currentOption || (currentOption instanceof Array && !currentOption.length);

        this.setState({ isError: invalid });
        return EventEmitter.emit(invalid ? EVENTS.FORM.ON_VALIDATE_FAILURE : EVENTS.FORM.ON_VALIDATE_SUCCESS);
    };

    render() {
        const { loadedOptions, currentOption, isError } = this.state;
        const {
            className,
            readOnly,
            disabled,
            required,
            menuPosition = 'absolute',
            validateErrorMessage = 'Поле обязательно для заполнения',
            label,
            theme
        } = this.props;
        const isDarkTheme = theme === THEME_TYPE.DARK;

        return (
            <div {...cls('', {error: isError, disabled}, {validated: required, [className]: !!className})}>
                <label {...cls('label')}>
                    {label && <span {...cls('label-text', '', 'drag-handle')}>{label}</span>}

                    <AsyncCreatable
                        cacheOptions
                        defaultOptions={loadedOptions}
                        loadOptions={_.debounce(this.getOptions, 1000)}
                        onChange={this.handleSelect}
                        onBlur={this.handleBlur}
                        value={currentOption}
                        formatCreateLabel={(inputValue) => `Создать "${inputValue}"`}
                        menuPosition={menuPosition}

                        classNamePrefix='select'
                        isDisabled={readOnly || disabled}
                        placeholder='Выберите...'
                        isClearable
                        styles={ReactSelectStyles(isDarkTheme)}
                        loadingMessage={() => 'Загрузка...'}
                    />
                </label>

                {isError && <span {...cls('message')}>{validateErrorMessage}</span>}
            </div>
        );
    }
}

export default connect(({theme}) => ({theme}))(AsyncCreatableSelect);
