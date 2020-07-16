import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {KEY_CODE} from '../../../constants';
import './inline-button.scss';

const cls = new Bem('inline-button');

export default class InlineButton extends Component {
    static propTypes = {
        className: PropTypes.string,
        href: PropTypes.string,
        onClick: PropTypes.func,
        children: PropTypes.node,
        text: PropTypes.string,
        small: PropTypes.bool,
        danger: PropTypes.bool,
        disabled: PropTypes.bool
    };

    handleKeyDown = (event) => {
        if ([KEY_CODE.space, KEY_CODE.enter].includes(event.keyCode)) {
            this.props.onClick();
        }
    };

    focus = () => {
        this.inlineButton.focus();
    };

    render() {
        const {className, onClick, text, children, small, danger, disabled} = this.props;

        return (
            <a
                ref={ref => this.inlineButton = ref}
                {...cls('', {small, danger, disabled}, className)}
                role='button'
                onClick={onClick}
                onKeyDown={this.handleKeyDown}
                disabled={disabled}
                tabIndex={0}
            >
                {text || children}
            </a>
        );
    }
}
