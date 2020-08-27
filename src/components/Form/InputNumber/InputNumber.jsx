import React, {Component} from 'react';
import PropTypes from 'prop-types';
import './input-number.scss';

const cls = new Bem('input-number');

export default class InputNumber extends Component {
    static propTypes = {
        className: PropTypes.string,
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        onChange: PropTypes.func.isRequired,
        label: PropTypes.string.isRequired,
        readOnly: PropTypes.bool,
        draggable: PropTypes.bool
    };

    state = {
        error: false
    };

    handleChange = (event) => {
        if (event.target.validity.valid) {
            this.props.onChange(event.target.value);
        }
    };

    render() {
        const {className, label, value, readOnly, draggable, required} = this.props;
        const {error} = this.state;
        const isFocused = this.inputRef === document.activeElement;
        const isError = error;
        const isSucceed = !!value && !isError;
        const isEmpty = !value.length;

        return (
            <div
                {...cls('', {
                    error: isError,
                    focused: isFocused,
                    succeed: isSucceed,
                    empty: isEmpty,
                    readOnly
                }, className)}
            >
                <label {...cls('label', { error: required && !value })}>
                    {label && <span {...cls('label-text', '', { 'drag-handle': draggable })}>{label}</span>}

                    <input
                        {...cls('field')}
                        type='text'
                        pattern='[0-9]*'
                        readOnly={readOnly}
                        onChange={this.handleChange}
                        value={value || ''}
                        data-error={error}
                        ref={ref => this.inputRef = ref}
                    />
                </label>
            </div>
        );
    }
}
