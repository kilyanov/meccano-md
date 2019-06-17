import API from '../api/api';
import ApiList from '../api/apiList';
import {ParseToRequest} from '../helpers/Tools';
import axios from 'axios';

const CancelToken = axios.CancelToken;

let source;

export const ProjectService = {
    get: (id = '', params) => {
        source = CancelToken.source();
        return API.get(`${ApiList.project.project}${id ? `/${id}` : ''}${ParseToRequest(params)}`);
    },
    delete: (id) => API.delete(`${ApiList.project.project}/${id}`),
    post: (form) => API.post(ApiList.project.project, form),
    put: (id, form) => {
        source = CancelToken.source();
        return API.put(`${ApiList.project.project}/${id}`, form);
    },
    getSections: (projectId) => API.get(`${ApiList.project.sections}${ParseToRequest({projectId})}`),
    createSections: (projectId, form) => API.post(`${ApiList.project.sections}${ParseToRequest({projectId})}`, form),
    getFields: (projectId) => API.get(`${ApiList.project.fieldValue}?id=${projectId}`),
    cancelLast: () => source && source.cancel('Operation canceled by the user.')
};
