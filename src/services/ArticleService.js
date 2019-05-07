import API from '../api/api';
import ApiList from '../api/apiList';
import {ParseToRequest} from '../helpers/Tools';

export const ArticleService = {
    get: (id = '', form) => API.get(`${ApiList.article}${id ? `/${id}` : ''}${ParseToRequest(form)}`),
    getList: (form) => API.get(`${ApiList.article}${ParseToRequest(form)}`),
    delete: (id) => API.delete(`${ApiList.article}/${id}`),
    create: (form) => API.post(ApiList.article, form),
    update: (form, id) => API.put(`${ApiList.article}/${id}`, form),
    upload: (projectId, form) => API.post(`${ApiList.article}/${projectId}/upload`, form)
};
