import {ACTION_TYPE} from "../../../constants/ActionTypes";

export const setArticleColors = (colors) => {
    return {
        type: ACTION_TYPE.ARTICLE_COLORS.SET,
        payload: colors
    };
};

export const clearArticleColors = () => {
    return {
        type: ACTION_TYPE.ARTICLE_COLORS.CLEAR
    };
};
