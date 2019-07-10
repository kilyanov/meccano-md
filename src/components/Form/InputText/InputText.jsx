import React, {Component} from 'react';
import PropTypes from 'prop-types';

import './input-text.scss';
import {EventEmitter} from '../../../helpers';
import {EVENTS} from '../../../constants/Events';

const classes = new Bem('input-text');

export default class InputText extends Component {
    static propTypes = {
        autoFocus: PropTypes.bool,
        className: PropTypes.string,
        type: PropTypes.string,
        name: PropTypes.string,
        label: PropTypes.string,
        value: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number
        ]).isRequired,
        onChange: PropTypes.func,
        onClick: PropTypes.func,
        disabled: PropTypes.bool,
        controlled: PropTypes.bool,
        clearable: PropTypes.bool,
        placeholder: PropTypes.string,
        validateType: PropTypes.oneOf(['notEmpty', 'email', 'link']),
        validateErrorMessage: PropTypes.string,
        onValidate: PropTypes.func,
        required: PropTypes.bool,
        children: PropTypes.node
    };

    static defaultProps = {
        label: '',
        type: 'text',
        onClick: () => {},
        onChange: () => {},
        validateErrorMessage: 'Поле обязательно для заполнения',
        controlled: true
    };

    state = {
        value: this.props.value,
        error: false
    };

    componentDidMount() {
        EventEmitter.on(EVENTS.FORM.ON_VALIDATE, this.validate);
    }

    componentWillUnmount() {
        EventEmitter.off(EVENTS.FORM.ON_VALIDATE, this.validate);
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.value !== prevState.value) {
            return {value: nextProps.value, error: false};
        }

        return null;
    }

    handleChange = (event) => {
        const {controlled, onChange} = this.props;
        const value = event.target.value.replace(/^\s*/, '');

        if (value || value === '') {
            if (controlled) onChange(value);
            else this.setValue(value);
        }
    };

    handleClear = () => {
        if (this.props.controlled) {
            this.props.onChange('');

            if (this.state.error) {
                this.setState({error: false});
            }
        } else {
            this.setValue('');
        }
    };

    getValue = () => {
        return this.state.value;
    };

    setValue = (value) => {
        this.setState({
            value,
            error: false
        }, () => {
            this.props.onChange(value);
            this.validate(value);
        });
    };

    focus = () => {
        this.inputRef.focus();
    };

    isValidate = (value) => {
        const {validateType, required, onValidate, type} = this.props;

        if (onValidate && onValidate instanceof Function) {
            return onValidate(value);
        }

        if (validateType || required) {
            switch (validateType) {
                default:
                case 'notEmpty':
                    return value.length > 0;
                case 'email':
                    return this.validateEmail(value);
                case 'link':
                    return this.validateLink(value);
            }
        }

        if (type === 'email') return this.validateEmail(value);
    };

    isError = () => {
        return this.state.error;
    };

    validate = (value = this.state.value) => {
        const {validateType, type, onValidate, required} = this.props;

        if (validateType || onValidate || type === 'email' || required) {
            const error = !this.isValidate(value);

            EventEmitter.emit(error ? EVENTS.FORM.ON_VALIDATE_FAILURE : EVENTS.FORM.ON_VALIDATE_SUCCESS);
            this.setState({error});
            return error;
        }
    };

    validateEmail = (value) => {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        return re.test(String(value).toLowerCase());
    };

    validateLink = (value) => {
        const re = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;

        return re.test(String(value).toLowerCase());
    };

    render() {
        const {
            autoFocus,
            className,
            label,
            name,
            placeholder,
            controlled,
            required,
            clearable,
            type,
            onClick,
            validateType,
            validateErrorMessage,
            children
        } = this.props;
        const {error} = this.state;
        const isFocused = this.inputRef === document.activeElement;
        const isError = error; // && !isFocused
        const isLink = validateType === 'link';
        const value = controlled ? this.props.value : this.state.value;
        const isSucceed = !!value && !isError;
        const isValidated = required || validateType;
        const isEmpty = !value.length;

        return (
            <div
                ref={this.props.ref}
                {...classes('', {
                    error: isError,
                    focused: isFocused,
                    succeed: isSucceed,
                    empty: isEmpty,
                    link: isLink
                }, {
                    validated: isValidated,
                    error: isError,
                    [className]: !!className
                })}
            >
                <label {...classes('label')}>
                    {label && <span {...classes('label-text', '', 'drag-handle')} title={label}>{label}</span>}

                    <input
                        {...classes("field")}
                        autoFocus={autoFocus}
                        placeholder={placeholder}
                        type={type}
                        required={required}
                        name={name}
                        value={value}
                        onChange={this.handleChange}
                        onSubmit={() => this.validate()}
                        onClick={onClick}
                        data-error={isError || (required && !value)}
                        ref={node => this.inputRef = node}
                    />

                    {(isLink && !isError) &&
                        <a href={value} target='_blank'>
                            <img {...classes('earth-icon')} src={require('./img/earth-icon.svg')}/>
                        </a>
                    }

                    {((isError || clearable) && !isEmpty) && (
                        <div
                            {...classes('clear')}
                            onClick={this.handleClear}
                        >✕</div>
                    )}

                    {(isError && validateErrorMessage) && (
                        <span {...classes('message')}>{validateErrorMessage}</span>
                    )}
                </label>

                {children}
            </div>
        );
    }
}
