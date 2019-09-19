import React from 'react';
import {connect} from 'react-redux';
import NotificationIcon from '../../SvgIcons/NotificationIcon';
import './notifications-button.scss';
import store from '../../../../redux/store';
import {toggleNotificationPanel} from '../../../../redux/actions/notificationsPanel';

const cls = new Bem('notifications-button');

const NotificationsButton = ({
    className,
    notificationsPanel
}) => {
    const {notifications} = notificationsPanel;

    return (
        <div
            {...cls('', '', className)}
            onClick={() => store.dispatch(toggleNotificationPanel())}
        >
            <NotificationIcon {...cls('icon')}/>
            {!!notifications.length && <i {...cls('count')}>{notifications.length}</i>}
        </div>
    );
};

export default connect(({notificationsPanel}) => ({notificationsPanel}))(NotificationsButton);
