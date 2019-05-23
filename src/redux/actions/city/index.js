import types from "../../../constants/ActionTypes";
import {CityService} from '../../../services';

export const getCity = () => ({
    type: types.REQUEST,
    actions: [
        types.city.CITY_LOADING,
        types.city.CITY_LOADED,
        types.city.CITY_LOAD_FAILURE
    ],
    promise: CityService.get()
});

export const addCity = (form) => ({
    type: types.city.ADD,
    payload: form
});

export const updateCity = (form) => ({
    type: types.city.UPDATE,
    id: form.id,
    payload: form
});

export const deleteCity = (articleId) => ({
    type: types.city.DELETE,
    id: articleId
});
