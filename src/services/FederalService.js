import API from '../api/api';
import ApiList from '../api/apiList';
import {ParseToRequest} from '../helpers/Tools';

export const FederalService = {
    get: (id = '', form) => API.get(`${ApiList.federal}${id ? `/${id}` : ''}${ParseToRequest(form)}`),
    delete: (id) => API.delete(`${ApiList.federal}/${id}`),
    create: (form) => API.post(ApiList.federal, form),
    update: (form, id) => API.put(`${ApiList.federal}/${id}`, form)
};
