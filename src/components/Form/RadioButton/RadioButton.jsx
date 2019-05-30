import React from 'react';
import PropTypes from 'prop-types';
import './radio-button.scss';

const classes = new Bem('radio-button');

const RadioButton = ({
    className,
    label = '',
    checked = false,
    disabled,
    name,
    value,
    onChange
}) => (
    <div {...classes('', {disabled, checked}, className)}>
        <label {...classes('label')}>
            <span {...classes('box')} />

            <input
                {...classes('field')}
                type='radio'
                disabled={disabled}
                name={name}
                value={value}
                checked={checked}
                onChange={() => onChange(!checked, value)}
            />

            <span {...classes('label-text')}>{label}</span>
        </label>
    </div>
);

RadioButton.propTypes = {
    className: PropTypes.string,
    label: PropTypes.string,
    checked: PropTypes.bool,
    name: PropTypes.string.isRequired,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired
};

export default RadioButton;
