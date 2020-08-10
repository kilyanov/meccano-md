import { ACTION_TYPE } from "../../../constants/ActionTypes";

export const setCurrentArticle = (article) => {
    return {
        type: ACTION_TYPE.CURRENT_ARTICLE.SET,
        payload: article
    };
};

export const clearCurrentArticle = () => {
    return {
        type: ACTION_TYPE.CURRENT_ARTICLE.CLEAR
    };
};
