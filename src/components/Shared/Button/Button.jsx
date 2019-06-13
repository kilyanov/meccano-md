import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';

import './button.scss';

const classes = new Bem('button');

const Button = ({
    to,
    className,
    disabled,
    style,
    viewType,
    onClick = () => {},
    tabIndex = 0,
    text,
    type = 'button'
}) => {
    return to ? (
        <Link
            {...classes('', {
                [style]: !!style,
                [viewType]: !!viewType,
                disabled
            }, className)}
            to={to}
            tabIndex={tabIndex}
            disabled={disabled}
        >{text}</Link>
    ) : (
        <button
            {...classes('', {
                [style]: !!style,
                [viewType]: !!viewType,
                disabled
            }, className)}
            type={type}
            tabIndex={tabIndex}
            onClick={onClick}
            disabled={disabled}
        >{text}</button>
    );
};

Button.propTypes = {
    className: PropTypes.string,
    disabled: PropTypes.bool,
    to: PropTypes.string,
    style: PropTypes.oneOf(['default', 'success', 'error', 'info', 'inline']),
    viewType: PropTypes.oneOf(['inline', 'default']),
    text: PropTypes.string.isRequired,
    onClick: PropTypes.func,
    type: PropTypes.string
};

export default Button;
