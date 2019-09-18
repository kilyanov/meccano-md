export const ACTION_TYPE = {
    REQUEST: 'REQUEST',
    PROFILE: {
        PROFILE_LOADING: 'PROFILE_LOADING',
        PROFILE_LOADED: 'PROFILE_LOADED',
        PROFILE_LOAD_FAILURE: 'PROFILE_LOAD_FAILURE'
    },
    NOTIFICATION_PANEL: {
        OPEN: 'NOTIFICATION_PANEL_OPEN',
        CLOSE: 'NOTIFICATION_PANEL_CLOSE',
        TOGGLE: 'NOTIFICATION_PANEL_TOGGLE',
        ADD_NOTIFICATION: 'ADD_NOTIFICATION',
        DELETE_NOTIFICATION: 'DELETE_NOTIFICATION',
        NOTIFICATIONS_LOADING: 'NOTIFICATIONS_LOADING',
        NOTIFICATIONS_LOADED: 'NOTIFICATIONS_LOADED',
        NOTIFICATIONS_LOAD_FAILURE: 'NOTIFICATIONS_LOAD_FAILURE'
    },
    SETTINGS_MENU: {
        OPEN: 'SETTINGS_MENU_OPEN',
        CLOSE: 'SETTINGS_MENU_CLOSE',
        TOGGLE: 'SETTINGS_MENU_TOGGLE',
    },
    THEME: {
        SWITCH: 'THEME_SWITCH'
    }
};
