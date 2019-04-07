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
