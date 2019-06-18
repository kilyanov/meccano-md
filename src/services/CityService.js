import API from '../api/api';
import ApiList from '../api/apiList';
import {ParseToRequest} from '../helpers/Tools';
import axios from 'axios';

const CancelToken = axios.CancelToken;

let source;

export const CityService = {
    get: (id = '', form) => {
        source = CancelToken.source();
        return API.get(`${ApiList.city}${id ? `/${id}` : ''}${ParseToRequest(form)}`, {
            cancelToken: source.token
        });
    },
    delete: (id) => API.delete(`${ApiList.city}/${id}`),
    create: (form) => API.post(ApiList.city, form),
    update: (form, id) => API.put(`${ApiList.city}/${id}`, form),
    cancelLast: () => source && source.cancel('Operation canceled by the user.')
};
