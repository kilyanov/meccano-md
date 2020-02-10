export const ACTION_TYPE = {
    REQUEST: 'REQUEST',
    PROFILE: {
        PROFILE_LOADING: 'PROFILE_LOADING',
        PROFILE_LOADED: 'PROFILE_LOADED',
        PROFILE_LOAD_FAILURE: 'PROFILE_LOAD_FAILURE'
    },
    ROLES: {
        ROLES_LOADING: 'ROLES_LOADING',
        ROLES_LOADED: 'ROLES_LOADED',
        ROLES_LOAD_FAILURE: 'ROLES_LOAD_FAILURE'
    },
    NOTIFICATION_PANEL: {
        OPEN: 'NOTIFICATION_PANEL_OPEN',
        CLOSE: 'NOTIFICATION_PANEL_CLOSE',
        TOGGLE: 'NOTIFICATION_PANEL_TOGGLE',
        ADD_NOTIFICATION: 'ADD_NOTIFICATION',
        UPDATE_NOTIFICATION: 'UPDATE_NOTIFICATION',
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
    },
    PROJECT: {
        PROJECTS_LOADING: 'PROJECTS_LOADING',
        PROJECTS_LOADED: 'PROJECTS_LOADED',
        PROJECTS_LOAD_FAILURE: 'PROJECTS_LOAD_FAILURE',
        ADD: 'PROJECT_ADD',
        UPDATE: 'PROJECT_UPDATE',
        DELETE: 'PROJECT_DELETE'
    },
    DOCUMENT: {
        DOCUMENT_LOADING: 'DOCUMENTS_LOADING',
        DOCUMENTS_LOADED: 'DOCUMENTS_LOADED',
        DOCUMENTS_LOAD_FAILURE: 'DOCUMENTS_LOAD_FAILURE',
        ADD: 'DOCUMENT_ADD',
        UPDATE: 'DOCUMENT_ADD',
        DELETE: 'DOCUMENT_ADD'
    },
    USER: {
        TYPES: {
            LOADING: 'USER_TYPES_LOADING',
            LOADED: 'USER_TYPES_LOADED',
            LOAD_FAILURE: 'USER_TYPES_LOAD_FAILURE'
        },
        LOGOUT: 'USER_LOGOUT'
    },
    CURRENT_PROJECT: {
        SET: 'CURRENT_PROJECT_SET',
        CLEAR: 'CURRENT_PROJECT_CLEAR'
    }
};
