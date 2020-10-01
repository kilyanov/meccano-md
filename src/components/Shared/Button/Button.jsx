import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';

import './button.scss';

const cls = new Bem('button');

const Button = ({
    to,
    className,
    disabled,
    style,
    viewType,
    onClick = () => {},
    tabIndex = 0,
    text,
    type = 'button',
    children,
    title
}) => {
    return to ? (
        <Link
            {...cls('', {
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
            {...cls('', {
                [style]: !!style,
                [viewType]: !!viewType,
                disabled
            }, className)}
            type={type}
            title={title}
            tabIndex={tabIndex}
            onClick={onClick}
            disabled={disabled}
        >{children || text}</button>
    );
};

Button.propTypes = {
    className: PropTypes.string,
    disabled: PropTypes.bool,
    to: PropTypes.string,
    style: PropTypes.oneOf(['default', 'success', 'error', 'info', 'inline']),
    viewType: PropTypes.oneOf(['inline', 'default']),
    text: PropTypes.string,
    onClick: PropTypes.func,
    type: PropTypes.string
};

export default Button;
