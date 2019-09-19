import React, {Component} from 'react';
import PropTypes from 'prop-types';
import './panel-notification.scss';

const cls = new Bem('panel-notification');

export default class PanelNotification extends Component {
    static propTypes = {
        notification: PropTypes.object.isRequired
    };

    render() {
        const {notification, onClose} = this.props;

        return (
            <div {...cls()}>
                <div {...cls('data')}>
                    <h4 {...cls('title')}>{notification.title}</h4>
                    <p {...cls('message')}>{notification.message}</p>
                </div>

                <button
                    {...cls('button', 'close')}
                    onClick={() => onClose(notification)}
                >✕</button>
            </div>
        );
    }
}
