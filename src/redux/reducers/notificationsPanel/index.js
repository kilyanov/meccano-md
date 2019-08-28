import TYPES from "../../../constants/ActionTypes";

export function notificationsPanel(state = {}, action) {
    switch (action.type) {
        case TYPES.NOTIFICATION_PANEL.NOTIFICATIONS_LOADED:
            return {
                ...state,
                notifications: _.uniqBy([...state.notifications, ...action.data], 'id')
            };
        case TYPES.NOTIFICATION_PANEL.ADD_NOTIFICATION:
            return {
                ...state,
                notifications: {...state.notifications, ...action.payload}
            };
        case TYPES.NOTIFICATION_PANEL.DELETE_NOTIFICATION:
            return {
                ...state,
                notifications: state.notifications.filter(({id}) => id !== action.id)
            };
        case TYPES.NOTIFICATION_PANEL.OPEN:
            return {...state, open: true};
        case TYPES.NOTIFICATION_PANEL.CLOSE:
            return {...state, open: false};
        case TYPES.NOTIFICATION_PANEL.TOGGLE:
            return {...state, open: !state.open};
        default:
            return state;
    }
}
