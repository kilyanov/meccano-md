import types from "../../../constants/ActionTypes";
import {CountryService} from '../../../services';

export const getCountry = () => ({
    type: types.REQUEST,
    actions: [
        types.country.CITY_LOADING,
        types.country.CITY_LOADED,
        types.country.CITY_LOAD_FAILURE
    ],
    promise: CountryService.get()
});

export const addCountry = (form) => ({
    type: types.country.ADD,
    payload: form
});

export const updateCountry = (form) => ({
    type: types.country.UPDATE,
    id: form.id,
    payload: form
});

export const deleteCountry = (articleId) => ({
    type: types.country.DELETE,
    id: articleId
});
