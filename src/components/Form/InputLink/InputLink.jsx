import React from 'react';
import PropTypes from 'prop-types';
import InputText from '../InputText/InputText';

const InputLink = ({label, value, onChange, className}) => (
    <InputText
        className={className}
        label={label}
        validateType='link'
        validateErrorMessage='Неверный адрес ссылки'
        value={value || ''}
        onChange={val => onChange(val)}
    />
);

InputLink.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string
};

export default InputLink;
