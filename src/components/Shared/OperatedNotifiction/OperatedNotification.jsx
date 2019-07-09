import React, {Component} from 'react';
import PropTypes from 'prop-types';
import './operated-notification.scss';
import {EventEmitter} from '../../../helpers';
import {EVENTS} from '../../../constants/Events';

const classes = new Bem('operated-notification');

export default class OperatedNotification extends Component {
    static propTypes = {
        title: PropTypes.string,
        message: PropTypes.string,
        submitButtonText: PropTypes.string,
        cancelButtonText: PropTypes.string,
        timeOut: PropTypes.number,
        onSubmit: PropTypes.func.isRequired,
        onCancel: PropTypes.func,
        type: PropTypes.oneOf(['info', 'success', 'warning', 'error'])
    };

    static defaultProps = {
        message: '',
        submitButtonText: 'Ок',
        cancelButtonText: 'Отмена',
        type: 'info'
    };

    componentDidMount() {
        if (this.props.timeOut) {
            setTimeout(() => {
                EventEmitter.emit(EVENTS.OPERATED_NOTIFICATION.HIDE);
            }, this.props.timeOut);
        }
    }

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
            <div {...classes(null, type)}>
                <h4 {...classes('title')}>{title}</h4>
                <p {...classes('message')}>{message}</p>

                <div {...classes('buttons-container')}>
                    <button
                        {...classes('button', 'submit')}
                        onClick={() => {
                            EventEmitter.emit(EVENTS.OPERATED_NOTIFICATION.HIDE);
                            onSubmit();
                        }}
                    >
                        {submitButtonText}
                    </button>

                    {onCancel && (
                        <button
                            {...classes('button', 'cancel')}
                            onClick={() => {
                                EventEmitter.emit(EVENTS.OPERATED_NOTIFICATION.HIDE);
                                onCancel();
                            }}
                        >
                            {cancelButtonText}
                        </button>
                    )}
                </div>
            </div>
        );
    }
}
