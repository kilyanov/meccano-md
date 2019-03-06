import React from 'react';
import './checkbox.scss';

const classes = new Bem('checkbox');
const CheckBox = ({
    checked = false,
    name = '',
    label = '',
    disabled = false,
    onChange = () => {},
    className
}) => (
    <div {...classes('', {disabled, checked}, className)}>
        <label {...classes('label')}>
            <span {...classes('box')} />

            <input
                {...classes('field')}
                type="checkbox"
                checked={checked}
                name={name}
                onChange={() => onChange(!checked)}
            />

            <span {...classes('text')}>{label}</span>
        </label>
    </div>
);

export default CheckBox;
