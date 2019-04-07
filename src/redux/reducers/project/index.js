import types from "../../../constants/ActionTypes";

export function projects(state = {}, action) {
    switch (action.type) {
        case types.project.PROJECTS_LOADED:
            return action.data;
        default:
            return state;
    }
}
