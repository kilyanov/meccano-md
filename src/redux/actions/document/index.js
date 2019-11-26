import {ACTION_TYPE} from "../../../constants/ActionTypes";
import {DocumentService} from "../../../services";

export const getDocuments = (userId) => {
    const form = {
        sort: '-updated_at',
        userId,
        page: 1,
        pageSize: 5
    };

    return {
        type: ACTION_TYPE.REQUEST,
        actions: [
            ACTION_TYPE.DOCUMENT.DOCUMENT_LOADING,
            ACTION_TYPE.DOCUMENT.DOCUMENTS_LOADED,
            ACTION_TYPE.DOCUMENT.DOCUMENTS_LOAD_FAILURE
        ],
        promise: DocumentService.get(form)
    }
};
