import {ACTION_TYPE} from "../../../constants/ActionTypes";

export function userTypes(state = {}, action) {
    switch (action.type) {
        case ACTION_TYPE.USER.TYPES.LOADED:
            return action.data;
        default:
            return state;
    }
}
