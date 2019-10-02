import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import './panel-notification.scss';
import store from '../../../../redux/store';
import {closeNotificationPanel, deleteNotification} from '../../../../redux/actions/notificationsPanel';

const cls = new Bem('panel-notification');

export default class PanelNotification extends Component {
    static propTypes = {
        notification: PropTypes.object.isRequired
    };

    render() {
        const {notification, onClose} = this.props;
        const Wrapper = notification.link ? Link : React.createElement('div');
        const handleClick = () => {
            if (notification.link) {
                setTimeout(() => {
                    store.dispatch(closeNotificationPanel());
                    store.dispatch(deleteNotification(notification.id));
                }, 100);
            }
        };

        return (
            <Wrapper
                {...cls()}
                to={notification.link}
            >
                <div {...cls('data')} onClick={() => handleClick()}>
                    <h4 {...cls('title')}>{notification.title}</h4>
                    <p {...cls('message')}>{notification.message}</p>
                </div>

                <button
                    {...cls('button', 'close')}
                    onClick={() => onClose(notification)}
                >✕</button>
            </Wrapper>
        );
    }
}
