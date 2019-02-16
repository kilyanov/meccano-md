import React from 'react';
import PropTypes from 'prop-types';

import './button.scss';

const Button = ({className, disabled, onClick, text, type = 'text'}) => {
    const classes = new Bem('button');

    return (
        <button
            {...classes('', '', className)}
            type={type}
            onClick={onClick}
            disabled={disabled}
        >{text}</button>
    );
};

Button.propTypes = {
    className: PropTypes.string,
    disabled: PropTypes.bool,
    text: PropTypes.string.isRequired,
    onClick: PropTypes.func,
    type: PropTypes.string
};

export default Button;
