import {ACTION_TYPE} from "../../../constants";

export function currentArchive(state = {}, action) {
    switch (action.type) {
        case ACTION_TYPE.CURRENT_ARCHIVE.SET:
            return action.payload;
        case ACTION_TYPE.CURRENT_ARCHIVE.CLEAR:
            return null;
        default:
            return state;
    }
}
