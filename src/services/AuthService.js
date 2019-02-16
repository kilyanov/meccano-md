import API from '../api/api';
import ApiList from '../api/apiList';

export default {
    login: (form) => API.post(ApiList.auth.login, form),
    create: (form) => API.post(ApiList.auth.create, form)
};
