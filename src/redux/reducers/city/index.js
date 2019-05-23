import types from "../../../constants/ActionTypes";

export function city(state = {}, action) {
    switch (action.type) {
        case types.city.CITY_LOADED:
            return _.uniqBy([...state, ...action.data], 'id');
        case types.city.ADD:
            return [...state, action.payload];
        case types.city.UPDATE:
            return state.map(item => (item.id === action.id) ? {...item, ...action.payload} : item);
        case types.city.DELETE:
            return state.filter(({id}) => id !== action.id);
        default:
            return state;
    }
}
