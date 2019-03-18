import API from '../api/api';
import ApiList from '../api/apiList';

export const ProjectService = {
    get: (id = '') => API.get(`${ApiList.project}${id ? `/${id}` : ''}`),
    delete: (id) => API.get(`${ApiList.project}/${id}`),
    post: (form) => API.post(ApiList.project, form),
    put: (form) => API.put(ApiList.project, form)
};
