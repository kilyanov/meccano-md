import {ACTION_TYPE} from "../../../constants/ActionTypes";
import {ArticleService} from '../../../services/ArticleService';

export const getNotifications = () => ({
    type: ACTION_TYPE.REQUEST,
    actions: [
        ACTION_TYPE.NOTIFICATION_PANEL.NOTIFICATIONS_LOADING,
        ACTION_TYPE.NOTIFICATION_PANEL.NOTIFICATIONS_LOADED,
        ACTION_TYPE.NOTIFICATION_PANEL.NOTIFICATIONS_LOAD_FAILURE
    ],
    promise: ArticleService.getList()
});

export const addNotification = (form) => ({type: ACTION_TYPE.NOTIFICATION_PANEL.ADD_NOTIFICATION, payload: form});

export const deleteNotification = (id) => ({type: ACTION_TYPE.NOTIFICATION_PANEL.DELETE_NOTIFICATION, id});

export const openNotificationPanel = () => ({type: ACTION_TYPE.NOTIFICATION_PANEL.OPEN});

export const closeNotificationPanel = () => ({type: ACTION_TYPE.NOTIFICATION_PANEL.CLOSE});

export const toggleNotificationPanel = () => ({type: ACTION_TYPE.NOTIFICATION_PANEL.TOGGLE});
