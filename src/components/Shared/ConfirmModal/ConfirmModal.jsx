import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import Button from "../Button/Button";
import './confirm-modal.scss';

const classes = new Bem('confirm-modal');

export default class ConfirmModal extends PureComponent {
    static propTypes = {
        title: PropTypes.string,
        children: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
        onClose: PropTypes.func.isRequired,
        onSubmit: PropTypes.func,
        onCancel: PropTypes.func
    };

    render() {
        const {title, children, onClose, onCancel, onSubmit} = this.props;

        return (
            <div {...classes('')}>
                <section {...classes('header')}>
                    <h3 {...classes('title')}>{title}</h3>
                    <button
                        onClick={onClose}
                        {...classes('close-button')}
                    >&#10005;</button>
                </section>
                <section {...classes('body')}>
                    {children}
                </section>
                <section {...classes('footer')}>
                    <Button
                        text='Подтвердить'
                        onClick={() => {
                            onSubmit();
                            onClose();
                        }}
                    />
                    <Button
                        text='Отмена'
                        onClick={() => {
                            onCancel();
                            onClose();
                        }}
                    />
                </section>
            </div>
        );
    }
}
