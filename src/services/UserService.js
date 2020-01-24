import API from '../api/api';
import {createURLGenerator} from '../api/apiList';

const urlGenerator = createURLGenerator('user');

export const UserService = {
    get: (id) => API.get(urlGenerator('user')(id)),
    getProfile: (id) => API.get(urlGenerator('profile')(id ? {id} : {})),
    create: (form) => API.post(urlGenerator('create')(), form),
    update: (form, id) => API.put(urlGenerator('user')(id), form),
    delete: (id) => API.delete(urlGenerator('user')(id)),
    roles: () => API.get(urlGenerator('roles')()),
    types: {
        get: (id = '') => API.get(urlGenerator('type')(id)),
        create: (form) => API.post(urlGenerator('type')(), form),
        update: (form, id) => API.put(urlGenerator('type')(id), form),
        delete: (id) => API.delete(urlGenerator('type')(id))
    },
    project: {
        getList: (projectId) => API.get(urlGenerator('project')(projectId)),
        get: (projectId, useId) => API.get(urlGenerator('project')(projectId, useId)),
        create: (form, projectId) => API.post(urlGenerator('project')(projectId), form),
        update: (form, id) => API.put(urlGenerator('project')(id), form),
        delete: (projectId, useId) => API.delete(urlGenerator('project')(projectId, useId))
    }
};
