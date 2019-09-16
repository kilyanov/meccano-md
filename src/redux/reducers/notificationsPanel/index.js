import  {ACTION_TYPE} from "../../../constants/ActionTypes";

export function notificationsPanel(state = {}, action) {
    switch (action.type) {
        case ACTION_TYPE.NOTIFICATION_PANEL.NOTIFICATIONS_LOADED:
            return {
                ...state,
                notifications: _.uniqBy([...state.notifications, ...action.data], 'id')
            };
        case ACTION_TYPE.NOTIFICATION_PANEL.ADD_NOTIFICATION:
            return {
                ...state,
                notifications: {...state.notifications, ...action.payload}
            };
        case ACTION_TYPE.NOTIFICATION_PANEL.DELETE_NOTIFICATION:
            return {
                ...state,
                notifications: state.notifications.filter(({id}) => id !== action.id)
            };
        case ACTION_TYPE.NOTIFICATION_PANEL.OPEN:
            return {...state, open: true};
        case ACTION_TYPE.NOTIFICATION_PANEL.CLOSE:
            return {...state, open: false};
        case ACTION_TYPE.NOTIFICATION_PANEL.TOGGLE:
            return {...state, open: !state.open};
        default:
            return state;
    }
}
