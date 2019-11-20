import API from '../api/api';
import {createURLGenerator} from '../api/apiList';

const urlGenerator = createURLGenerator('user');

export const UserService = {
    get: (id) => API.get(urlGenerator('user')(id)),
    getProfile: () => API.get(urlGenerator('profile')()),
    create: (form) => API.post(urlGenerator('create')(), form),
    update: (id, form) => API.put(urlGenerator('user')(id), form),
    roles: () => API.get(urlGenerator('roles')())
};
