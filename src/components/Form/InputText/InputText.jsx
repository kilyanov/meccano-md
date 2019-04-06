import React, {Component} from 'react';
import PropTypes from 'prop-types';

import './input-text.scss';

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
        onChange: PropTypes.func.isRequired,
        onClick: PropTypes.func,
        disabled: PropTypes.bool,
        controlled: PropTypes.bool,
        placeholder: PropTypes.string,
        validateType: PropTypes.oneOf(['notEmpty', 'email', 'link']),
        validateErrorMessage: PropTypes.string,
        onValidate: PropTypes.func
    };

    static defaultProps = {
        label: '',
        type: 'text',
        onClick: () => {},
        validateErrorMessage: 'Error message'
    };

    state = {
        value: this.props.value,
        error: false
    };

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.value !== prevState.value) {
            return {value: nextProps.value};
        }

        return null;
    }

    handleChange = (event) => {
        const {controlled, validateType, type, onValidate, onChange} = this.props;
        const value = event.target.value.replace(/^\s*/, '');

        if (value || value === '') {
            if (controlled) {
                onChange(value);
            } else {
                this.setValue(value);
            }

            if (validateType || onValidate || type === 'email') {
                this.setState({error: !this.isValidate(value)});
            }
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
        }, () => this.props.onChange(value));
    };

    focus = () => {
        this.inputRef.focus();
    };

    isValidate = (value) => {
        const {validateType, onValidate, type} = this.props;

        if (onValidate && onValidate instanceof Function) {
            return onValidate(value);
        }

        if (validateType) {
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
            type,
            onClick,
            validateType,
            validateErrorMessage
        } = this.props;
        const {error} = this.state;
        const isFocused = this.inputRef === document.activeElement;
        const isError = error; // && !isFocused
        const isLink = validateType === 'link';
        const value = controlled ? this.props.value : this.state.value;
        const isSucceed = !!value && !isError;

        return (
            <div
                {...classes('', {
                    error: isError,
                    focused: isFocused,
                    succeed: isSucceed,
                    link: isLink
                }, className)}
            >
                <label {...classes('label')}>
                    {label && <span {...classes('label-text')}>{label}</span>}

                    <input
                        {...classes("field")}
                        autoFocus={autoFocus}
                        placeholder={placeholder}
                        type={type}
                        name={name}
                        value={value}
                        onChange={this.handleChange}
                        onClick={onClick}
                        ref={node => this.inputRef = node}
                    />

                    {isLink &&
                        <img {...classes('earth-icon')} src={require('./img/earth-icon.svg')}/>
                    }

                    {isError && (
                        <div
                            {...classes('clear')}
                            onClick={this.handleClear}
                        />
                    )}

                    {(isError && validateErrorMessage) && (
                        <span {...classes('message')}>{validateErrorMessage}</span>
                    )}
                </label>
            </div>
        );
    }
}
