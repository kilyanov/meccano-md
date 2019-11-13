import {ACTION_TYPE} from "../../../constants/ActionTypes";

export function roles(state = {}, action) {
    switch (action.type) {
        case ACTION_TYPE.ROLES.ROLES_LOADED:
            return action.data;
        default:
            return state;
    }
}
