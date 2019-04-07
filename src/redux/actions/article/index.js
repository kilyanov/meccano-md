import types from "../../../constants/ActionTypes";
import { ArticleService } from '../../../services/ArticleService';

export const getArticlesByProject = (projectId) => ({
    type: types.REQUEST,
    actions: [
        types.article.ARTICLE_BY_PROJECT_LOADING,
        types.article.ARTICLE_BY_PROJECT_LOADED,
        types.article.ARTICLE_BY_PROJECT_LOAD_FAILURE
    ],
    promise: ArticleService
        .getList({project: projectId})
        .then(response => {
            response.data.map(item => {
                item.projectId = projectId;
                return item;
            });

            return response;
        })
});

export const addArticle = (form) => ({
    type: types.article.ADD,
    payload: form
});

export const updateArticle = (form) => ({
    type: types.article.UPDATE,
    id: form.id,
    payload: form
});
