export function ReactSelectStyles(isDarkTheme, readOnly) {
    const darkColor = readOnly ? '#525252' : '#313131';
    const lightColor = readOnly ? '#f2f2f2' : '#fff';

    return {
        control: (provided, {isFocused, isSelected}) => {
            return {
                ...provided,
                borderRadius: 0,
                minHeight: 40,
                backgroundColor: isDarkTheme ? darkColor : lightColor,
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
            backgroundColor: isDarkTheme ? darkColor : lightColor
        }),
        option: (provided, {isDisabled, isFocused, isSelected}) => {
            return {
                ...provided,
                backgroundColor: isDisabled ? null :
                    isSelected ? isDarkTheme ? '#525252' : '#ccc' :
                        isFocused ? isDarkTheme ? '#525252' : '#ccc' : null
            };
        },
        multiValue: (provided) => ({
            ...provided,
            backgroundColor: isDarkTheme ? '#989898' : '#e6e6e6'
        }),
        multiValueRemove: (provided) => ({
            ...provided,
            color: isDarkTheme ? '#313131' : null
        })
    };
}
