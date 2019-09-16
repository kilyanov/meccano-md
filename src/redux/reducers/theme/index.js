import {ACTION_TYPE} from "../../../constants/ActionTypes";
import {THEME_TYPE} from '../../../constants/ThemeType';

export function theme(state = {}, action) {
    switch (action.type) {
        case ACTION_TYPE.THEME.SWITCH:
            return state === THEME_TYPE.LIGHT ? THEME_TYPE.DARK : THEME_TYPE.LIGHT;
        default:
            return state;
    }
}
