import types from "../../../constants/ActionTypes";
import { ProjectService } from '../../../services/ProjectService';

export const getProjects = () => ({
    type: types.REQUEST,
    actions: [
        types.project.PROJECTS_LOADING,
        types.project.PROJECTS_LOADED,
        types.project.PROJECTS_LOAD_FAILURE
    ],
    promise: ProjectService.get()
});

export const addProject = (form) => ({
    type: types.project.ADD,
    payload: form
});

export const updateArticle = (form) => ({
    type: types.project.UPDATE,
    id: form.id,
    payload: form
});

export const deleteArticle = (articleId) => ({
    type: types.project.DELETE,
    id: articleId
});
