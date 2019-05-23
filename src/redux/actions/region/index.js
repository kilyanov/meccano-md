import types from "../../../constants/ActionTypes";
import {CountryService} from '../../../services';

export const getRegion = () => ({
    type: types.REQUEST,
    actions: [
        types.region.CITY_LOADING,
        types.region.CITY_LOADED,
        types.region.CITY_LOAD_FAILURE
    ],
    promise: CountryService.get()
});

export const addRegion = (form) => ({
    type: types.region.ADD,
    payload: form
});

export const updateRegion = (form) => ({
    type: types.region.UPDATE,
    id: form.id,
    payload: form
});

export const deleteRegion = (articleId) => ({
    type: types.region.DELETE,
    id: articleId
});
