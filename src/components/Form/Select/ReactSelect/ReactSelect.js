import React from 'react';
import Select from 'react-select';
import { useSelector } from "react-redux";
import { THEME_TYPE } from "@const";
import { ReactSelectStyles } from "@const/ReactSelectStyles";

const cls = new Bem('select');

export default function ReactSelect({
    autoFocus,
    className,
    selected,
    readOnly,
    options,
    onChange,
    draggable,
    label,
    required,
    placeholder,
    isMulti,
    onBlur,
    onKeyDown,
    onlyValue
}) {
    const theme = useSelector(state => state.theme);
    const isDarkTheme = theme === THEME_TYPE.DARK;
    const selectedValue = isMulti
        ? options.filter(({ value }) => selected?.find(item => item.value === value))
        : options.find(({ value }) => value === selected);

    return (
        <div {...cls('', { succeed: !!selectedValue }, className)}>
            {(label && !onlyValue) && (
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
                { ...cls('field', { onlyValue }) }
                autoFocus={autoFocus}
                onBlur={onBlur && onBlur}
                placeholder={placeholder || 'Выберите...'}
                label={label}
                options={options || []}
                value={selectedValue || null}
                isMulti={isMulti}
                isDisabled={readOnly}
                onChange={onChange}
                onKeyDown={onKeyDown}
                styles={ReactSelectStyles(isDarkTheme)}
                isClearable
                classNamePrefix='select'
            />
        </div>
    );
}
