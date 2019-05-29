import API from '../api/api';
import ApiList from '../api/apiList';
import {ParseToRequest} from '../helpers/Tools';
import axios from 'axios';

const CancelToken = axios.CancelToken;

let source;

export const ArticleService = {
    get: (id = '', form) => API.get(`${ApiList.article.article}${id ? `/${id}` : ''}${ParseToRequest(form)}`),
    getList: (form) => API.get(`${ApiList.article.article}${ParseToRequest(form)}`),
    delete: (id) => API.delete(`${ApiList.article.article}/${id}`),
    create: (form) => API.post(ApiList.article.article, form),
    update: (form, id) => API.put(`${ApiList.article.article}/${id}`, form),
    upload: (projectId, form) => API.post(`${ApiList.article.article}/${projectId}/upload`, form),

    /* Data fields */
    types: (form) => {
        source = CancelToken.source();
        return API.get(`${ApiList.article.type}${ParseToRequest(form)}`);
    },
    rating: (form) => {
        source = CancelToken.source();
        return API.get(`${ApiList.article.rating}${ParseToRequest(form)}`);
    },
    heading: (form) => {
        source = CancelToken.source();
        return API.get(`${ApiList.article.heading}${ParseToRequest(form)}`);
    },
    author: (form) => {
        source = CancelToken.source();
        return API.get(`${ApiList.article.author}${ParseToRequest(form)}`);
    },
    genre: (form) => {
        source = CancelToken.source();
        return API.get(`${ApiList.article.genre}${ParseToRequest(form)}`);
    },
    cancelLast: () => source && source.cancel('Operation canceled by the user.')
};
