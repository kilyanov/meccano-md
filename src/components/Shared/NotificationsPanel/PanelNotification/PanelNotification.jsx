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
        const handleClick = () => {
            if (notification.onClick) notification.onClick(notification);
            if (notification.link) {
                setTimeout(() => {
                    store.dispatch(closeNotificationPanel());
                    store.dispatch(deleteNotification(notification.id));
                }, 100);
            }
        };
        const children = (
            <>
                <section {...cls('body')}>
                    <div {...cls('data')} onClick={() => handleClick()}>
                        <h4 {...cls('title')}>{notification.title}</h4>
                        <p {...cls('message')}>{notification.message}</p>
                    </div>

                    <button
                        {...cls('close-button')}
                        onClick={() => onClose(notification)}
                    >✕</button>
                </section>

                {(notification.buttons && notification.buttons.length) && (
                    <section {...cls('buttons')}>
                        {notification.buttons.map((button, buttonIndex) => (
                            <button
                                key={buttonIndex}
                                type='button'
                                {...cls('button')}
                                onClick={() => button.onClick()}
                                title={button.title}
                            >{button.label || button.name || button.title}</button>
                        ))}
                    </section>
                )}
            </>
        );

        return notification.link ?
            <Link {...cls()} to={notification.link} >{children}</Link> :
            <div {...cls()}>{children}</div>;
    }
}
