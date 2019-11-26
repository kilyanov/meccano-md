import {ACTION_TYPE} from "../../../constants/ActionTypes";

export function projects(state = {}, action) {
    switch (action.type) {
        case ACTION_TYPE.PROJECT.PROJECTS_LOADED:
            return action.data;
        case ACTION_TYPE.PROJECT.ADD:
            return [...state, action.payload];
        case ACTION_TYPE.PROJECT.UPDATE:
            return state.map(item => (item.id === action.id) ? {...item, ...action.payload} : item);
        case ACTION_TYPE.PROJECT.DELETE:
            return state.filter(({id}) => id !== action.id);
        default:
            return state;
    }
}
