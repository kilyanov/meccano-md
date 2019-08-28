import TYPES from "../../../constants/ActionTypes";
import {ArticleService} from '../../../services/ArticleService';

export const getNotifications = () => ({
    type: TYPES.REQUEST,
    actions: [
        TYPES.NOTIFICATION_PANEL.NOTIFICATIONS_LOADING,
        TYPES.NOTIFICATION_PANEL.NOTIFICATIONS_LOADED,
        TYPES.NOTIFICATION_PANEL.NOTIFICATIONS_LOAD_FAILURE
    ],
    promise: ArticleService.getList()
});

export const addNotification = (form) => ({type: TYPES.NOTIFICATION_PANEL.ADD_NOTIFICATION, payload: form});

export const deleteNotification = (id) => ({type: TYPES.NOTIFICATION_PANEL.DELETE_NOTIFICATION, id});

export const openNotificationPanel = () => ({type: TYPES.NOTIFICATION_PANEL.OPEN});

export const closeNotificationPanel = () => ({type: TYPES.NOTIFICATION_PANEL.CLOSE});

export const toggleNotificationPanel = () => ({type: TYPES.NOTIFICATION_PANEL.TOGGLE});
