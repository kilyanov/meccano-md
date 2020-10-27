import React from 'react';
import Select from 'react-select';
import { useSelector } from "react-redux";
import { THEME_TYPE } from "../../../../constants";
import { ReactSelectStyles } from "../../../../constants/ReactSelectStyles";

const cls = new Bem('select');

export default function ReactSelect({
    className,
    selected,
    readOnly,
    options,
    onChange,
    draggable,
    label,
    required,
    placeholder,
    isMulti
}) {
    const theme = useSelector(state => state.theme);
    const isDarkTheme = theme === THEME_TYPE.DARK;
    const selectedValue = options.find(({ value }) => value === selected);

    return (
        <div {...cls('', { succeed: !!selectedValue }, className)}>
            {label && (
                <label
                    title={required ? 'Обязательное поле' : ''}
                    {...cls(
                        'label',
                        { required: required && (!selectedValue || !selectedValue.value) },
                        { 'drag-handle': draggable }
                    )}
                >
                    <span {...cls('label-text', '', { 'drag-handle': draggable })}>{label}</span>
                </label>
            )}

            <Select
                placeholder={placeholder || 'Выберите...'}
                label={label}
                options={options || []}
                value={selectedValue || null}
                isMulti={isMulti}
                isDisabled={readOnly}
                onChange={onChange}
                styles={ReactSelectStyles(isDarkTheme)}
                isClearable
                classNamePrefix='select'
            />
        </div>
    );
}
