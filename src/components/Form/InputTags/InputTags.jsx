import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Select from 'react-select/async-creatable';
import {EventEmitter} from '../../../helpers';
import {EVENTS} from '../../../constants/Events';
import './input-tags.scss';
import {THEME_TYPE} from '../../../constants/ThemeType';
import {ReactSelectStyles} from "../../../constants/ReactSelectStyles";

const cls = new Bem('input-tags');

class InputTags extends Component {
    static propTypes = {
        required: PropTypes.bool,
        theme: PropTypes.string.isRequired
    };

    state = {
        defaultOptions: []
    };

    componentDidMount() {
        this.getDefaultOptions();
        EventEmitter.on(EVENTS.FORM.ON_VALIDATE, this.validate);
    }

    componentWillUnmount() {
        EventEmitter.off(EVENTS.FORM.ON_VALIDATE, this.validate);
    }

    getDefaultOptions = () => {
        if (!this.props.requestService) return;

        this.props.requestService().then(response => {
            const defaultOptions = response.data.map(({id, name}) => ({value: id, label: name}));

            this.setState({defaultOptions});
        });
    };

    onLoadOptions = (value) => {
        if (!this.props.requestService) return;

        return this.props.requestService({'query[name]': value}).then(response => {
            return response.data.map(({id, name}) => ({value: id, label: name}));
        });
    };

    validate = () => {
        const invalid = this.props.required && !this.props.value;

        this.setState({error: invalid, opened: false});
        return EventEmitter.emit(invalid ? EVENTS.FORM.ON_VALIDATE_FAILURE : EVENTS.FORM.ON_VALIDATE_SUCCESS);
    };

    render() {
        const {label, theme, onChange, options, readOnly} = this.props;
        const {defaultOptions} = this.state;
        const isDarkTheme = theme === THEME_TYPE.DARK;

        return (
            <div {...cls('', {succeed: !!this.props.value.length})}>
                {label && (
                    <label {...cls('label', '', 'drag-handle')}>
                        <span {...cls('label-text', '', 'drag-handle')}>{label}</span>
                    </label>
                )}

                <Select
                    {...cls('field')}
                    placeholder={'Начните вводить текст...'}
                    isMulti
                    isSearchable
                    onChange={onChange}
                    readOnly={readOnly}
                    value={options}
                    defaultOptions={defaultOptions}
                    loadingMessage={() => 'Загрузка...'}
                    noOptionsMessage={() => 'Нет элементов'}
                    loadOptions={this.onLoadOptions}
                    styles={ReactSelectStyles(isDarkTheme)}
                />
            </div>
        );
    }
}

export default connect(({theme}) => ({theme}))(InputTags);
