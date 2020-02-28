import {ACTION_TYPE} from "../../../constants/ActionTypes";

export const setCurrentProject = (project) => {
    return {
        type: ACTION_TYPE.CURRENT_PROJECT.SET,
        payload: project
    };
};

export const clearCurrentProject = () => {
    return {
        type: ACTION_TYPE.CURRENT_PROJECT.CLEAR
    };
};
