import React from 'react';
import Select from 'react-select';
import { useSelector } from "react-redux";
import { THEME_TYPE } from "../../../../constants";
import { ReactSelectStyles } from "../../../../constants/ReactSelectStyles";

const cls = new Bem('select');

export default function ReactSelect({
    selected,
    readOnly,
    options,
    onChange,
    label
}) {
    const theme = useSelector(state => state.theme);
    const isDarkTheme = theme === THEME_TYPE.DARK;
    const selectedValue = options.find(({ value }) => value === selected);

    return (
        <div {...cls()}>
            {label && (
                <label {...cls('label', '', 'drag-handle')}>
                    <span {...cls('label-text', '', 'drag-handle')}>{label}</span>
                </label>
            )}

            <Select
                placeholder='Выберите...'
                label={label}
                options={options || []}
                value={selectedValue}
                isDisabled={readOnly}
                onChange={onChange}
                styles={ReactSelectStyles(isDarkTheme)}
                isClearable
                classNamePrefix='select'
            />
        </div>
    );
}
