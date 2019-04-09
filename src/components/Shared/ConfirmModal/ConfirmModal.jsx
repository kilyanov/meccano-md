import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import Button from "../Button/Button";
import './confirm-modal.scss';

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
        buttons: PropTypes.array,
        width: PropTypes.oneOf(['wide', 'normal', 'small'])
    };

    static defaultProps = {
        buttons: Object.keys(BUTTONS),
        onCancel: () => {},
        onSubmit: () => {},
        submitText: 'Подтвердить',
        cancelText: 'Отмена',
        width: 'normal'
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
