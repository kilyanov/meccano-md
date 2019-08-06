import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import './icon-button.scss';

const classes = new Bem('icon-button');

const IconButton = ({
    to,
    className = '',
    iconComponent,
    danger,
    disabled,
    onClick = () => {},
    text,
    type = 'button'
}) => {
    return to ? (
        <Link
            {...classes('', {disabled, danger}, className)}
            to={to}
            disabled={disabled}
        >
            {iconComponent && iconComponent}
            <span {...classes('label')}>{text}</span>
        </Link>
    ) : (
        <button
            {...classes('', {disabled, danger}, className)}
            type={type}
            onClick={onClick}
            disabled={disabled}
        >
            {iconComponent && iconComponent}
            <span {...classes('label')}>{text}</span>
        </button>
    );
};

IconButton.propTypes = {
    className: PropTypes.string,
    disabled: PropTypes.bool,
    danger: PropTypes.bool,
    iconComponent: PropTypes.node.isRequired,
    to: PropTypes.string,
    text: PropTypes.string.isRequired,
    onClick: PropTypes.func,
    type: PropTypes.string
};

export default IconButton;
