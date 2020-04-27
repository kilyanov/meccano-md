import React, {useEffect, useState} from 'react';
import AsyncCreatable from "react-select/async-creatable";
import {ReactSelectStyles} from "../../../constants/ReactSelectStyles";
import {useSelector} from "react-redux";
import {THEME_TYPE} from "../../../constants";
import BEMHelper from "react-bem-helper";

const cls = new BEMHelper('select');

export default function AsyncCreatableSelect({
    placeholder,
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
    const [loadedOptions, setLoadedOptions] = useState(options);
    const [currentOption, setCurrentOption] = useState({});
    const handleSelect = (option) => {
        setCurrentOption(option);
        onChange(option);
    };
    const getOptions = (inputValue = '', callback = () => {}) => {
        if (requestCancelService) {
            requestCancelService();
        }

        return requestService({ 'query[name]': inputValue }).then(({ data }) => {
            console.log(data);
            const opt = data.map(option => ({
                label: _.get(option, 'name'),
                value: _.get(option, 'id')
            }));

            setLoadedOptions(opt);
            callback(opt);
            return opt;
        });
    };

    useEffect(() => {
        if (requestService) {
            getOptions();

            if (selected) {
                requestService({'query[id]': selected}).then(({ data }) => {
                    if (data && data.length) {
                        const { name, id } = data[0];

                        setCurrentOption({ label: name, value: id });
                    }
                });
            }
        }
    }, []);

    return (
        <div {...cls()}>
            <label {...cls('label')}>
                {label && <span {...cls('label-text', '', 'drag-handle')}>{label}</span>}

                <AsyncCreatable
                    cacheOptions
                    defaultOptions={loadedOptions}
                    loadOptions={_.debounce(getOptions, 1000)}
                    onChange={handleSelect}
                    value={currentOption}
                    formatCreateLabel={(inputValue) => `Создать "${inputValue}"`}

                    classNamePrefix='select'
                    isDisabled={readOnly}
                    placeholder='Выберите...'
                    isClearable
                    styles={ReactSelectStyles(isDarkTheme)}
                    loadingMessage={() => 'Загрузка...'}
                />
            </label>
        </div>
    );
}
