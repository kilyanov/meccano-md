import types from "../../../constants/ActionTypes";

export function federal(state = {}, action) {
    switch (action.type) {
        case types.federal.CITY_LOADED:
            return _.uniqBy([...state, ...action.data], 'id');
        case types.federal.ADD:
            return [...state, action.payload];
        case types.federal.UPDATE:
            return state.map(item => (item.id === action.id) ? {...item, ...action.payload} : item);
        case types.federal.DELETE:
            return state.filter(({id}) => id !== action.id);
        default:
            return state;
    }
}
