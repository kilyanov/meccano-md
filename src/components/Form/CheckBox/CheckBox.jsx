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
    onLabelClick = () => {},
    className,
    children
}) => (
    <div {...cls('', {disabled, checked}, className)}>
        <label
            {...cls('label', { required })} title={required ? 'Обязательное поле' : ''}
            onClick={onLabelClick}
        >
            <span {...cls('box')} />

            <input
                {...cls('field')}
                type="checkbox"
                checked={checked}
                required={required}
                name={name}
                onChange={(event) => onChange(!checked, event)}
            />

            <div {...cls('data')}>
                <span {...cls('text')}>{label}</span>
                {children && (
                    <div {...cls('children')}>{children}</div>
                )}
            </div>
        </label>
    </div>
);

export default CheckBox;
