import types from "../../../constants/ActionTypes";
import {SourceService} from '../../../services';

export const getSource = () => ({
    type: types.REQUEST,
    actions: [
        types.source.SOURCE_LOADING,
        types.source.SOURCE_LOADED,
        types.source.SOURCE_LOAD_FAILURE
    ],
    promise: SourceService.get()
});

export const addSource = (form) => ({
    type: types.source.ADD,
    payload: form
});

export const updateSource = (form) => ({
    type: types.source.UPDATE,
    id: form.id,
    payload: form
});

export const deleteSource = (articleId) => ({
    type: types.source.DELETE,
    id: articleId
});
