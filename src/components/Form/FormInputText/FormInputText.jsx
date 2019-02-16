import React, {Component} from 'react';
import PropTypes from 'prop-types';

import './form-input.scss';

export default class FormInputText extends Component {
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
        placeholder: PropTypes.string
    };

    static defaultProps = {
        label: '',
        type: 'text',
        onClick: () => {}
    };

    state = {
        value: this.props.value,
        error: false,
        errorMessage: ''
    };

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.value !== prevState.value) {
            return {value: nextProps.value};
        }
    }

    handleChange = (event) => {
        const {error} = this.state;
        const value = event.target.value.replace(/^\s*/, '');

        if (value || value === '') {
            if (this.props.controlled) {
                this.props.onChange(value);
                if (error) this.setState({error: false});
            } else {
                this.setValue(value);
            }
        }
    };

    getValue() {
        return this.state.value;
    }

    setValue(value) {
        this.setState({
            value,
            error: false
        }, () => this.props.onChange(value));
    }

    setError(errorMessage) {
        this.setState({
            error: true,
            errorMessage
        });
    }

    focus = () => {
        this.inputRef.focus();
    };

    render() {
        const classes = new Bem('form-input');
        const {error} = this.state;
        const isFocused = this.inputRef === document.activeElement;
        const isError = error && !isFocused;
        const {
            autoFocus,
            className,
            label,
            name,
            placeholder,
            controlled,
            type,
            onClick
        } = this.props;

        return (
            <div
                {...classes('', {
                    error: isError,
                    focused: isFocused
                }, className)}
            >
                <label {...classes('label')}>
                    <span {...classes('label-text')}>{label}</span>
                    <input
                        {...classes("field")}
                        autoFocus={autoFocus}
                        placeholder={placeholder}
                        type={type}
                        name={name}
                        value={controlled ? this.props.value : this.state.value}
                        onChange={this.handleChange}
                        onClick={onClick}
                        ref={node => this.inputRef = node}
                    />
                </label>
            </div>
        );
    }
}
