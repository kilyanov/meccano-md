import types from "../../../constants/ActionTypes";

export function source(state = {}, action) {
    switch (action.type) {
        case types.source.SOURCE_LOADED:
            return _.uniqBy([...state, ...action.data], 'id');
        case types.source.ADD:
            return [...state, action.payload];
        case types.source.UPDATE:
            return state.map(item => (item.id === action.id) ? {...item, ...action.payload} : item);
        case types.source.DELETE:
            return state.filter(({id}) => id !== action.id);
        default:
            return state;
    }
}
