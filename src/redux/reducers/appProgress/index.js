import {ACTION_TYPE} from "../../../constants";

export function appProgress(state = {}, action) {
    switch (action.type) {
        case ACTION_TYPE.APP.IN_PROGRESS:
            return action.payload;
        default:
            return state;
    }
}
