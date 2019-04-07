import API from '../api/api';
import ApiList from '../api/apiList';
import { Tools } from '../helpers/Tools';

export const ArticleService = {
    get: (id = '', form) => API.get(`${ApiList.article}${id ? `/${id}` : ''}${Tools.parseFormToRequest(form)}`),
    getList: (form) => API.get(`${ApiList.article}${Tools.parseFormToRequest(form)}`),
    delete: (id) => API.get(`${ApiList.article}/${id}`),
    post: (form) => API.post(ApiList.article, form),
    put: (form, id) => API.put(`${ApiList.article}/${id}`, form)
};
