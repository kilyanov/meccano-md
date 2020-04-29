import React, {useState} from 'react';
import Select from 'react-select';
import {useSelector} from "react-redux";
import {THEME_TYPE} from "../../../../constants";
import {ReactSelectStyles} from "../../../../constants/ReactSelectStyles";

const cls = new Bem('select');

export default function ReactSelect({
    selected,
    readOnly,
    options,
    requestService,
    requestCancelService,
    onChange,
    label
}) {
    const theme = useSelector(state => state.theme);
    const isDarkTheme = theme === THEME_TYPE.DARK;
    const [currentOption, setCurrentOption] = useState({});
    const handleSelect = (option) => {
        setCurrentOption(option);
        onChange(option);
    };

    return (
        <div {...cls()}>
            {label && (
                <label {...cls('label', '', 'drag-handle')}>
                    <span {...cls('label-text', '', 'drag-handle')}>{label}</span>
                </label>
            )}

            <Select
                onChange={handleSelect}
                onBlur={handleBlur}
                value={currentOption}
                formatCreateLabel={(inputValue) => `Создать "${inputValue}"`}

                classNamePrefix='select'
                isDisabled={readOnly}
                placeholder='Выберите...'
                isClearable
                styles={ReactSelectStyles(isDarkTheme)}
                loadingMessage={() => 'Загрузка...'}
            />
        </div>
    );
}
