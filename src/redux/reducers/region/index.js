import types from "../../../constants/ActionTypes";

export function region(state = {}, action) {
    switch (action.type) {
        case types.region.CITY_LOADED:
            return _.uniqBy([...state, ...action.data], 'id');
        case types.region.ADD:
            return [...state, action.payload];
        case types.region.UPDATE:
            return state.map(item => (item.id === action.id) ? {...item, ...action.payload} : item);
        case types.region.DELETE:
            return state.filter(({id}) => id !== action.id);
        default:
            return state;
    }
}
