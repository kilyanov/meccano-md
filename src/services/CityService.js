import API from '../api/api';
import ApiList from '../api/apiList';
import {ParseToRequest} from '../helpers/Tools';

export const CityService = {
    get: (id = '', form) => API.get(`${ApiList.city}${id ? `/${id}` : ''}${ParseToRequest(form)}`),
    delete: (id) => API.delete(`${ApiList.city}/${id}`),
    create: (form) => API.post(ApiList.city, form),
    update: (form, id) => API.put(`${ApiList.city}/${id}`, form)
};
