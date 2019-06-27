import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import Button from "../Button/Button";
import './confirm-modal.scss';
import {KEY_CODE} from '../../../constants';

const classes = new Bem('confirm-modal');
const BUTTONS = {
    submit: 'submit',
    cancel: 'cancel'
};

export default class ConfirmModal extends PureComponent {
    static propTypes = {
        className: PropTypes.string,
        title: PropTypes.string,
        children: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
        onClose: PropTypes.func.isRequired,
        onSubmit: PropTypes.func,
        onCancel: PropTypes.func,
        cancelText: PropTypes.string,
        submitText: PropTypes.string,
        submitDisabled: PropTypes.bool,
        closeOnEsc: PropTypes.bool,
        buttons: PropTypes.array,
        width: PropTypes.oneOf(['wide', 'normal', 'small'])
    };

    static defaultProps = {
        buttons: Object.keys(BUTTONS),
        onCancel: () => {},
        onSubmit: () => {},
        closeOnEsc: true,
        submitText: 'Сохранить',
        cancelText: 'Отмена',
        width: 'normal'
    };

    componentDidMount() {
        if (this.props.closeOnEsc) document.addEventListener('keydown', this.handleDocumentKeyDown);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleDocumentKeyDown);
    }

    handleDocumentKeyDown = (event) => {
        if (event.keyCode === KEY_CODE.esc) {
            this.props.onClose();
        }
    };

    render() {
        const {
            className,
            title,
            children,
            onClose,
            onCancel,
            onSubmit,
            cancelText,
            submitText,
            submitDisabled,
            buttons,
            width
        } = this.props;

        return (
            <div {...classes('', {[width]: true}, className)}>
                <div {...classes('container')}>
                    <section {...classes('header')}>
                        <h2 {...classes('title')}>{title}</h2>
                        <button
                            onClick={onClose}
                            {...classes('close-button')}
                        >✕</button>
                    </section>

                    <section {...classes('body')}>
                        {children}
                    </section>

                    {!!buttons.length && (
                        <section {...classes('footer')}>
                            {buttons.includes(BUTTONS.cancel) && (
                                <Button
                                    {...classes('button', 'cancel')}
                                    text={cancelText}
                                    style='inline'
                                    tabIndex={0}
                                    onClick={() => {
                                        onCancel();
                                        onClose();
                                    }}
                                />
                            )}

                            {buttons.includes(BUTTONS.submit) && (
                                <Button
                                    {...classes('button', 'cancel')}
                                    text={submitText}
                                    type='submit'
                                    style='success'
                                    disabled={submitDisabled}
                                    tabIndex={0}
                                    onClick={() => {
                                        onSubmit();
                                        // onClose();
                                    }}
                                />
                            )}
                        </section>
                    )}
                </div>
            </div>
        );
    }
}
