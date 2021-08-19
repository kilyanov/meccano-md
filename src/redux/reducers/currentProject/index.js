import { ACTION_TYPE } from "../../../constants";

export function currentProject(state = {}, action) {
    switch (action.type) {
        case ACTION_TYPE.CURRENT_PROJECT.SET:
            return action.payload;
        case ACTION_TYPE.CURRENT_PROJECT.CLEAR:
            return null;
        default:
            return state;
    }
}
