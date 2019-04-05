import types from "../../../constants/ActionTypes";

export function profile(state = {}, action) {
    switch (action.type) {
        case types.user.profile.PROFILE_LOADED:
            return action.data;
        default:
            return state;
    }
}
