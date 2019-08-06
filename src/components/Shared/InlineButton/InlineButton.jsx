import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {KEY_CODE} from '../../../constants';
import './inline-button.scss';

const classes = new Bem('inline-button');

export default class InlineButton extends Component {
    static propTypes = {
        className: PropTypes.string,
        href: PropTypes.string,
        onClick: PropTypes.func,
        children: PropTypes.node,
        text: PropTypes.string,
        small: PropTypes.bool
    };

    handleKeyDown = (event) => {
        if ([KEY_CODE.space, KEY_CODE.enter].includes(event.keyCode)) {
            this.props.onClick();
        }
    };

    render() {
        const {className, onClick, text, children, small} = this.props;

        return (
            <a
                {...classes('', {small}, className)}
                role='button'
                onClick={onClick}
                onKeyDown={this.handleKeyDown}
                tabIndex={0}
            >
                {text || children}
            </a>
        );
    }
}
