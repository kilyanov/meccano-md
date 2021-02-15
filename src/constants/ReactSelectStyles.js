export function ReactSelectStyles(isDarkTheme, readOnly) {
    const darkColor = readOnly ? '#525252' : '#313131';
    const lightColor = readOnly ? '#f2f2f2' : '#fff';
    const lightDisabled = 'rgba(59, 59, 59, 0.3));';

    return {
        control: (provided, {isFocused, isSelected, isDisabled}) => {
            return {
                ...provided,
                borderRadius: 0,
                minHeight: 40,
                backgroundColor: isDarkTheme
                    ? isDisabled
                        ? darkColor
                        : darkColor
                    : isDisabled
                        ? lightDisabled
                        : lightColor,
                borderColor: isFocused || isSelected ? '#ccc' : '#ccc',
                pointerEvents: readOnly ? 'none' : 'all',
                '&:hover, &:active': {
                    borderColor: '#b2b2b2',
                    boxShadow: 'none'
                }
            };
        },
        placeholder: (provided) => ({
            ...provided,
            fontSize: 15,
            color: '#999'
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: isDarkTheme ? darkColor : lightColor,
            zIndex: 2
        }),
        menuList: (provided) => ({
            ...provided,
            position: 'relative'
        }),
        option: (provided, state) => {
            const isCreateItem = state?.label?.includes('Создать');

            return {
                ...provided,
                backgroundColor: state.isDisabled
                    ? null
                    : isCreateItem
                        ? '#00B956'
                        : state.isSelected
                            ? isDarkTheme
                                ? '#525252'
                                : '#ccc'
                            : state.isFocused
                                ? isDarkTheme
                                    ? '#525252'
                                    : '#ccc'
                                :  null,
                color: isCreateItem ? '#fff' : 'inherit',
                position: isCreateItem ? 'sticky' : 'unset',
                top: '-4px'
            };
        },
        multiValue: (provided) => ({
            ...provided,
            backgroundColor: isDarkTheme ? '#989898' : '#e6e6e6'
        }),
        multiValueRemove: (provided) => ({
            ...provided,
            color: isDarkTheme ? '#313131' : null
        }),
        singleValue: (provided) => ({
            ...provided,
            color: isDarkTheme ? '#f2f2f2' : null
        }),
        input: (provided) => ({
            ...provided,
            width: '100%'
        })
    };
}
