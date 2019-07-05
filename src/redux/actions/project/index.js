import types from "../../../constants/ActionTypes";
import { ProjectService } from '../../../services/ProjectService';

export const getProjects = () => ({
    type: types.REQUEST,
    actions: [
        types.project.PROJECTS_LOADING,
        types.project.PROJECTS_LOADED,
        types.project.PROJECTS_LOAD_FAILURE
    ],
    promise: ProjectService.get({expand: 'fields,sections'})
});

export const addProject = (form) => ({
    type: types.project.ADD,
    payload: form
});

export const updateProject = (form) => ({
    type: types.project.UPDATE,
    id: form.id,
    payload: form
});

export const deleteProject = (projectId) => ({
    type: types.project.DELETE,
    id: projectId
});
