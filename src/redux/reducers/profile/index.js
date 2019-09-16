import {ACTION_TYPE} from "../../../constants/ActionTypes";

export function profile(state = {}, action) {
    switch (action.type) {
        case ACTION_TYPE.PROFILE.PROFILE_LOADED:
            return action.data;
        default:
            return state;
    }
}
