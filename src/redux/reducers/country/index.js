import types from "../../../constants/ActionTypes";

export function countries(state = {}, action) {
    switch (action.type) {
        case types.country.COUNTRY_LOADED:
            return action.data;
        default:
            return state;
    }
}
