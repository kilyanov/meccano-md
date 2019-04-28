import API from '../api/api';
import ApiList from '../api/apiList';
import {Tools} from '../helpers/Tools';

export const ProjectService = {
    get: (id = '', params) => API.get(`${ApiList.project.project}${id ? `/${id}` : ''}${Tools.parseFormToRequest(params)}`),
    delete: (id) => API.delete(`${ApiList.project.project}/${id}`),
    post: (form) => API.post(ApiList.project.project, form),
    put: (id, form) => API.put(`${ApiList.project.project}/${id}`, form),
    getSections: (projectId) => API.get(`${ApiList.project.sections}${Tools.parseFormToRequest({projectId})}`)
};
