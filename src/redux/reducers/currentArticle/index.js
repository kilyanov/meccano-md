import {ACTION_TYPE} from "../../../constants";

export function currentArticle(state = {}, action) {
    switch (action.type) {
        case ACTION_TYPE.CURRENT_ARTICLE.SET:
            return action.payload;
        case ACTION_TYPE.CURRENT_ARTICLE.CLEAR:
            return null;
        default:
            return state;
    }
}
