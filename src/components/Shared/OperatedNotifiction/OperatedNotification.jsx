import React, {Component} from 'react';
import PropTypes from 'prop-types';
import './operated-notification.scss';
import {EventEmitter} from '../../../helpers';
import {EVENTS} from '../../../constants/Events';

const cls = new Bem('operated-notification');
const types = {
    info: 'info',
    success: 'success',
    warning: 'warning',
    error: 'error'
};
const POSITIVE_TYPES = [types.info, types.success];

export default class OperatedNotification extends Component {
    static propTypes = {
        title: PropTypes.string,
        message: PropTypes.string,
        submitButtonText: PropTypes.string,
        cancelButtonText: PropTypes.string,
        timeOut: PropTypes.number,
        onSubmit: PropTypes.func.isRequired,
        onCancel: PropTypes.func,
        type: PropTypes.oneOf(Object.keys(types)),
        closeOnClick: PropTypes.bool
    };

    static defaultProps = {
        message: '',
        submitButtonText: 'Ок',
        type: 'info'
    };

    componentDidMount() {
        if (this.props.timeOut || POSITIVE_TYPES.includes(this.props.type)) {
            setTimeout(() => {
                EventEmitter.emit(EVENTS.OPERATED_NOTIFICATION.HIDE);
            }, this.props.timeOut || 5000);
        }
    }

    handleClick = () => {
        if (POSITIVE_TYPES.includes(this.props.type) || this.props.closeOnClick) {
            EventEmitter.emit(EVENTS.OPERATED_NOTIFICATION.HIDE);
        }
    };

    render() {
        const {
            title,
            message,
            submitButtonText,
            cancelButtonText,
            onSubmit,
            onCancel,
            type
        } = this.props;

        return (
            <div {...cls(null, type)}>
                <div {...cls('content')}  onClick={this.handleClick}>
                    <h4 {...cls('title')}>{title}</h4>
                    <p {...cls('message')}>{message}</p>
                </div>

                <div {...cls('buttons-container')}>
                    <button
                        {...cls('button', 'submit')}
                        onClick={() => {
                            EventEmitter.emit(EVENTS.OPERATED_NOTIFICATION.HIDE);
                            onSubmit();
                        }}
                    >
                        {submitButtonText}
                    </button>

                    {(onCancel || cancelButtonText) && (
                        <button
                            {...cls('button', 'cancel')}
                            onClick={() => {
                                EventEmitter.emit(EVENTS.OPERATED_NOTIFICATION.HIDE);
                                if (onCancel) onCancel();
                            }}
                        >
                            {cancelButtonText || 'Отмена'}
                        </button>
                    )}
                </div>
            </div>
        );
    }
}
