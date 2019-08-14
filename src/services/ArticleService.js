import API from '../api/api';
import ApiList, {createURLGenerator} from '../api/apiList';
import {ParseToRequest} from '../helpers/Tools';
import axios from 'axios';

const urlGenerator = createURLGenerator('article');
const CancelToken = axios.CancelToken;

let source;

export const ArticleService = {
    get: (id = '', form) => API.get(`${ApiList.article.article}${id ? `/${id}` : ''}${ParseToRequest(form)}`),
    getList: (form) => API.get(`${ApiList.article.article}${ParseToRequest(form)}`),
    delete: (form, projectId) => API.delete(`${ApiList.article.article}?project=${projectId}`, {data: form}),
    create: (form) => API.post(ApiList.article.article, form),
    update: (form, id) => API.put(`${ApiList.article.article}/${id}`, form),

    /* Data fields */
    types: (form) => {
        source = CancelToken.source();
        return API.get(urlGenerator('type')(form));
    },
    rating: (form) => {
        source = CancelToken.source();
        return API.get(urlGenerator('rating')(form));
    },
    heading: (form) => {
        source = CancelToken.source();
        return API.get(urlGenerator('heading')(form));
    },
    author: (form) => {
        source = CancelToken.source();
        return API.get(urlGenerator('author')(form));
    },
    genre: (form) => {
        source = CancelToken.source();
        return API.get(urlGenerator('genre')(form));
    },
    cancelLast: () => source && source.cancel('Operation canceled by the user.')
};
