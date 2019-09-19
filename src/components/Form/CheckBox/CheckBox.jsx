import React from 'react';
import './checkbox.scss';

const cls = new Bem('checkbox');
const CheckBox = ({
    checked = false,
    name = '',
    label = '',
    disabled = false,
    required = false,
    onChange = () => {},
    className
}) => (
    <div {...cls('', {disabled, checked}, className)}>
        <label {...cls('label')}>
            <span {...cls('box')} />

            <input
                {...cls('field')}
                type="checkbox"
                checked={checked}
                required={required}
                name={name}
                onChange={() => onChange(!checked)}
            />

            <span {...cls('text')}>{label}</span>
        </label>
    </div>
);

export default CheckBox;
