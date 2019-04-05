import API from '../api/api';
import ApiList from '../api/apiList';
import {StorageService} from "./StorageService";
import {EventEmitter} from "../helpers";

export const AuthService = {
    login: (form) => {
        return API
            .post(ApiList.auth.login, form)
            .then(response => {
                StorageService.set('token', response.data.token);
                StorageService.set('token-expired', response.data.expired);
                API.setToken(response.data.token);

                return response;
            });
    },
    create: (form) => API.post(ApiList.auth.create, form),
    checkAuthorization: () => {
        const token = StorageService.get('token');
        const tokenExpired = StorageService.get('token-expired');

        if (token) {
            API.setToken(token);
        }

        if (!token || AuthService.isExpired(tokenExpired)) {
            StorageService.set('last-pathname', location.pathname);
            AuthService.logOut();
        }
    },
    isAuth: () => {
        const token = StorageService.get('token');
        const tokenExpired = StorageService.get('token-expired');

        return token && !AuthService.isExpired(tokenExpired);
    },
    isExpired: (expired) => {
        return moment(expired).local().isSameOrBefore(moment());
    },
    logOut: () => {
        StorageService.remove('token');
        StorageService.remove('token-expired');
        API.removeToken();
        EventEmitter.emit('redirect', '/login');
    }
};
