import types from "../../../constants/ActionTypes";

export function articles(state = {}, action) {
    switch (action.type) {
        case types.article.ARTICLE_BY_PROJECT_LOADED:
            return _.uniqBy([...state, ...action.data], 'id');
        case types.article.ADD:
            return [...state, action.payload];
        case types.article.UPDATE:
            return state.map(item => (item.id === action.id) ? {...item, ...action.payload} : item);
        case types.article.DELETE:
            return state.filter(({id}) => id !== action.id);
        default:
            return state;
    }
}
