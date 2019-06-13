import API from '../api/api';
import ApiList from '../api/apiList';
import {ParseToRequest} from '../helpers/Tools';
import axios from 'axios';

const CancelToken = axios.CancelToken;

let source;

export const SourceService = {
    get: (form) => {
        source = CancelToken.source();
        return API.get(`${ApiList.source.source}${ParseToRequest(form)}`, {
            cancelToken: source.token
        });
    },
    getById: (id = '') => API.get(`${ApiList.source.source}/${id}`),
    cancelLast: () => source && source.cancel('Operation canceled by the user.'),
    delete: (id) => API.delete(`${ApiList.source.source}/${id}`),
    create: (form) => API.post(ApiList.source.source, form),
    update: (form, id) => API.put(`${ApiList.source.source}/${id}`, form),
    type: {
        get: (form) => API.get(`${ApiList.source.type}${ParseToRequest(form)}`),
        create: (form) => API.post(ApiList.source.type, form),
        update: (form, id) => API.put(`${ApiList.source.type}/${id}`, form),
        delete: (id) => API.delete(`${ApiList.source.type}/${id}`)
    }
};
