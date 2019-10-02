import store from '../redux/store';
import {addNotification, deleteNotification} from '../redux/actions/notificationsPanel';
import {NotificationManager} from 'react-notifications';
import {NOTIFICATION_TYPE} from '../constants/NotificationType';

/**
 *  message: { id, title, message, type }
 */

export default class Notification {
    static success(message, timeout = 5000) {
        NotificationManager[NOTIFICATION_TYPE.success](message.message, message.title, timeout);
    }

    static warning(message, timeout = 5000) {
        NotificationManager[NOTIFICATION_TYPE.warning](message.message, message.title, timeout);
    }

    static error(message, timeout = 5000) {
        NotificationManager[NOTIFICATION_TYPE.error](message.message, message.title, timeout);
    }

    static toPanel(message) {
        message.id = _.uniqueId();
        message.type = NOTIFICATION_TYPE.panel;
        store.dispatch(addNotification(message));
        return message;
    }

    static updateNotification(id) {
        if (!id) return;

        store.dispatch()
    }

    static deleteNotification(id) {
        if (!id) return;

        store.dispatch(deleteNotification(id));
    }
}
