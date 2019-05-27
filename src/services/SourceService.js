import API from '../api/api';
import ApiList from '../api/apiList';
import {ParseToRequest} from '../helpers/Tools';
import axios from 'axios';

const CancelToken = axios.CancelToken;

let source;

export const SourceService = {
    get: (id = '', form) => {
        source = CancelToken.source();
        return API.get(`${ApiList.source.source}${id ? `/${id}` : ''}${ParseToRequest(form)}`, {
            cancelToken: source.token
        });
    },
    cancelGet: () => source && source.cancel('Operation canceled by the user.'),
    delete: (id) => API.delete(`${ApiList.source.source}/${id}`),
    create: (form) => API.post(ApiList.source.source, form),
    update: (form, id) => API.put(`${ApiList.source.source}/${id}`, form)
};
