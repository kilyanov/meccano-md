import API from '../api/api';
import ApiList from '../api/apiList';
import {ParseToRequest} from '../helpers/Tools';

export const SourceService = {
    get: (id = '', form) => API.get(`${ApiList.source.source}${id ? `/${id}` : ''}${ParseToRequest(form)}`),
    delete: (id) => API.delete(`${ApiList.source.source}/${id}`),
    create: (form) => API.post(ApiList.source.source, form),
    update: (form, id) => API.put(`${ApiList.source.source}/${id}`, form)
};
