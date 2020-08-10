import { ACTION_TYPE } from "../../../constants/ActionTypes";

export const setCurrentArchive = (archive) => {
    return {
        type: ACTION_TYPE.CURRENT_ARCHIVE.SET,
        payload: archive
    };
};

export const clearCurrentArchive = () => {
    return {
        type: ACTION_TYPE.CURRENT_ARCHIVE.CLEAR
    };
};
