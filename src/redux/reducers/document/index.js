import {ACTION_TYPE} from "../../../constants/ActionTypes";

export function documents(state = {}, action) {
    switch (action.type) {
        case ACTION_TYPE.DOCUMENT.DOCUMENTS_LOADED:
            return action.data;
        default:
            return state;
    }
}
