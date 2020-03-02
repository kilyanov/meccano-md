import React from 'react';
import PropTypes from 'prop-types';
import InputText from '../InputText/InputText';

const InputLink = ({label, value, onChange, className, readOnly}) => (
    <InputText
        className={className}
        label={label}
        readOnly={readOnly}
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
