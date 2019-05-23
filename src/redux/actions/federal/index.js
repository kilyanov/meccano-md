import types from "../../../constants/ActionTypes";
import {CountryService} from '../../../services';

export const getFederal = () => ({
    type: types.REQUEST,
    actions: [
        types.federal.FEDERAL_LOADING,
        types.federal.FEDERAL_LOADED,
        types.federal.FEDERAL_LOAD_FAILURE
    ],
    promise: CountryService.get()
});

export const addFederal = (form) => ({
    type: types.federal.ADD,
    payload: form
});

export const updateFederal = (form) => ({
    type: types.federal.UPDATE,
    id: form.id,
    payload: form
});

export const deleteFederal = (articleId) => ({
    type: types.federal.DELETE,
    id: articleId
});
