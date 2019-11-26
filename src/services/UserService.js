import API from '../api/api';
import {createURLGenerator} from '../api/apiList';

const urlGenerator = createURLGenerator('user');

export const UserService = {
    get: (id) => API.get(urlGenerator('user')(id)),
    getProfile: (id) => API.get(urlGenerator('profile')(id ? {id} : {})),
    create: (form) => API.post(urlGenerator('create')(), form),
    update: (form, id) => API.put(urlGenerator('user')(id), form),
    roles: () => API.get(urlGenerator('roles')())
};
