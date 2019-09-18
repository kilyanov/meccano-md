import  {ACTION_TYPE} from "../../../constants/ActionTypes";

export function settingsMenu(state = {}, action) {
    switch (action.type) {
        case ACTION_TYPE.SETTINGS_MENU.OPEN:
            return {...state, open: true};
        case ACTION_TYPE.SETTINGS_MENU.CLOSE:
            return {...state, open: false};
        case ACTION_TYPE.SETTINGS_MENU.TOGGLE:
            return {...state, open: !state.open};
        default:
            return state;
    }
}
