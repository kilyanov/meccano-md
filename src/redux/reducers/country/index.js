import types from "../../../constants/ActionTypes";

export function country(state = {}, action) {
    switch (action.type) {
        case types.country.CITY_LOADED:
            return _.uniqBy([...state, ...action.data], 'id');
        case types.country.ADD:
            return [...state, action.payload];
        case types.country.UPDATE:
            return state.map(item => (item.id === action.id) ? {...item, ...action.payload} : item);
        case types.country.DELETE:
            return state.filter(({id}) => id !== action.id);
        default:
            return state;
    }
}
