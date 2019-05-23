import API from '../api/api';
import ApiList from '../api/apiList';
import {ParseToRequest} from '../helpers/Tools';

export const CountryService = {
    get: (id = '', form) => API.get(`${ApiList.country}${id ? `/${id}` : ''}${ParseToRequest(form)}`),
    delete: (id) => API.delete(`${ApiList.country}/${id}`),
    create: (form) => API.post(ApiList.country, form),
    update: (form, id) => API.put(`${ApiList.country}/${id}`, form)
};
