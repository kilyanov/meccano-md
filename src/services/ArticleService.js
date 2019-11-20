import API from '../api/api';
import {createURLGenerator} from '../api/apiList';
import axios from 'axios';

const urlGenerator = createURLGenerator('article');
const CancelToken = axios.CancelToken;

let source;

export const ArticleService = {
    get: (id = '', form) => API.get(urlGenerator('article')(id, form)),
    getList: (form) => API.get(urlGenerator('article')(form)),
    delete: (form, projectId) => API.delete(urlGenerator('article')({project: projectId}), {data: form}),
    create: (form) => API.post(urlGenerator('article')({project: form.projectId}), form),
    update: (form, id) => API.put(urlGenerator('article')(id), form),

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
