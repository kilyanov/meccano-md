import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './textarea.scss';

const cls = new Bem('textarea');

export default class TextArea extends Component {
    static propTypes = {
        className: PropTypes.string,
        label: PropTypes.string,
        name: PropTypes.string,
        value: PropTypes.string,
        onChange: PropTypes.func,
        disabled: PropTypes.bool,
        required: PropTypes.bool,
        controlled: PropTypes.bool,
        validateErrorMessage: PropTypes.string,
        onValidate: PropTypes.func,
        placeholder: PropTypes.string
    };

    static defaultProps = {
        label: '',
        onChange: () => {
        },
        validateErrorMessage: 'Error message'
    };

    state = {
        value: this.props.value,
        error: false
    };

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.value !== prevState.value) {
            return { value: nextProps.value };
        }

        return null;
    }

    handleChange = (event) => {
        const { controlled, onValidate, onChange } = this.props;
        const value = event.target.value.replace(/^\s*/, '');

        if (value || value === '') {
            if (controlled) {
                onChange(value);
            } else {
                this.setValue(value);
            }

            if (onValidate) {
                this.setState({ error: !this.isValidate(value) });
            }
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
        const { required, onValidate } = this.props;

        if (onValidate && onValidate instanceof Function) {
            return onValidate(value);
        }

        if (required) {
            return value.length > 0;
        }
    };

    isError = () => {
        return this.state.error;
    };

    render() {
        const { className, label, name, controlled, draggable, placeholder, required } = this.props;
        const { error } = this.state;
        const isFocused = this.inputRef === document.activeElement;
        const isError = error; // && !isFocused
        const value = controlled ? this.props.value : this.state.value;
        const isSucceed = !!value && !isError;

        return (
            <div
                {...cls('', {
                    error: isError,
                    focused: isFocused,
                    succeed: isSucceed
                }, className)}
            >
                <label {...cls('label', { required })}>
                    {label && <span {...cls('label-text', '', { 'drag-handle': draggable })}>{label}</span>}

                    <textarea
                        {...cls('field')}
                        name={name}
                        value={value}
                        onChange={this.handleChange}
                        placeholder={placeholder}
                    />
                </label>
            </div>
        );
    }
}
