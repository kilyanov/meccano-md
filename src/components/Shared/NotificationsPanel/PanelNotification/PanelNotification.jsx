import React, {Component} from 'react';
import PropTypes from 'prop-types';
import './panel-notification.scss';

const classes = new Bem('panel-notification');

export default class PanelNotification extends Component {
    static propTypes = {
        notification: PropTypes.object.isRequired
    };

    render() {
        const {notification, onClose} = this.props;

        return (
            <div {...classes()}>
                <div {...classes('data')}>
                    <h4 {...classes('title')}>{notification.title}</h4>
                    <p {...classes('message')}>{notification.message}</p>
                </div>

                <button
                    {...classes('button', 'close')}
                    onClick={() => onClose(notification)}
                >✕</button>
            </div>
        );
    }
}
