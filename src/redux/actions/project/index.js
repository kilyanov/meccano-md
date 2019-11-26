import {ACTION_TYPE} from "../../../constants/ActionTypes";
import { ProjectService } from '../../../services/ProjectService';

export const getProjects = () => ({
    type: ACTION_TYPE.REQUEST,
    actions: [
        ACTION_TYPE.PROJECT.PROJECTS_LOADING,
        ACTION_TYPE.PROJECT.PROJECTS_LOADED,
        ACTION_TYPE.PROJECT.PROJECTS_LOAD_FAILURE
    ],
    promise: ProjectService.get()
});

export const addProject = (form) => ({
    type: ACTION_TYPE.PROJECT.ADD,
    payload: form
});

export const updateProject = (form) => ({
    type: ACTION_TYPE.PROJECT.UPDATE,
    id: form.id,
    payload: form
});

export const deleteProject = (projectId) => ({
    type: ACTION_TYPE.PROJECT.DELETE,
    id: projectId
});
