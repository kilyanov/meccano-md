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
        isError: false,
        inProgress: true
    }

    componentDidMount() {
        const { required, requestService, selected } = this.props;

        if (required) {
            EventEmitter.on(EVENTS.FORM.ON_VALIDATE, this.validate);
        }

        if (requestService) {
            this.getOptions('', () => {}, false);

            if (selected) {
                requestService({ 'query[id]': selected }).then(response => {
                    if (response && response.data && response.data.length) {
                        const { name, id } = response.data[0];

                        this.setState({ currentOption: { label: name, value: id }, inProgress: false });
                    }
                });
            }
        }
    }

    componentDidUpdate() {
        const { selected, requestService } = this.props;
        const { currentOption, loadedOptions, inProgress } = this.state;

        if (selected !== currentOption.value) {
            if (!selected) {
                if (!_.isEmpty(currentOption)) {
                    this.setState({ currentOption: {}, inProgress: false });
                }
            } else {
                const found = loadedOptions.find(({ value }) => value === selected);

                if (found) {
                    this.setState({ currentOption: found, inProgress: false });
                } else if (requestService && !inProgress) {
                    this.setState({ inProgress: true }, () => {
                        requestService({ 'query[id]': selected }).then(response => {
                            if (response && response.data && response.data.length) {
                                const { name, id } = response.data[0];

                                this.setState({ currentOption: { label: name, value: id }, inProgress: false });
                            }
                        });
                    });
                }
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

    getOptions = (inputValue = '', callback = () => {}, cancelLastRequest = true) => {
        const { requestService, requestCancelService, extendRequestForm } = this.props;
        let form = {};

        if (requestCancelService && cancelLastRequest) {
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

            this.setState({ loadedOptions: opt, inProgress: false });
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
            draggable,
            theme
        } = this.props;
        const isDarkTheme = theme === THEME_TYPE.DARK;

        return (
            <div
                {...cls('', {
                    error: isError,
                    disabled,
                    validated: required,
                    succeed: !!currentOption
                }, { [className]: !!className })}
            >
                <label {...cls('label')}>
                    {label && <span {...cls('label-text', '', { 'drag-handle': draggable })}>{label}</span>}

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
