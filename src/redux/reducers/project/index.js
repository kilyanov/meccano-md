import types from "../../../constants/ActionTypes";

export function projects(state = {}, action) {
    switch (action.type) {
        case types.project.PROJECTS_LOADED:
            return action.data;
        case types.project.ADD:
            return [...state, action.payload];
        case types.project.UPDATE:
            return state.map(item => (item.id === action.id) ? {...item, ...action.payload} : item);
        case types.project.DELETE:
            return state.filter(({id}) => id !== action.id);
        default:
            return state;
    }
}
