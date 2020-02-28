import {ACTION_TYPE} from "../../../constants/ActionTypes";

export function articleColors(state = {}, action) {
    switch (action.type) {
        case ACTION_TYPE.ARTICLE_COLORS.SET:
            return action.payload;
        case ACTION_TYPE.ARTICLE_COLORS.CLEAR:
            return null;
        default:
            return state;
    }
}
