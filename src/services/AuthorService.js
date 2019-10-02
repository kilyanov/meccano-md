import API from '../api/api';
import {createURLGenerator} from '../api/apiList';
import axios from 'axios';

const CancelToken = axios.CancelToken;
const urlGenerator = createURLGenerator('article');
const url = urlGenerator('author');

let source;

export const AuthorService = {
    get: (id = '', form) => {
        source = CancelToken.source();
        return API.get(url(id), {
            cancelToken: source.token,
            params: form
        });
    },
    delete: (id) => API.delete(url(id)),
    create: (form) => API.post(url(), form),
    update: (form, id) => API.put(url(id), form),
    cancelLast: () => source && source.cancel('Operation canceled by the user.')
};
