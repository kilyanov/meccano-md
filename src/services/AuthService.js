import API from '../api/api';
import ApiList from '../api/apiList';
import {StorageService} from "./StorageService";
import {EventEmitter} from "../helpers";

export const AuthService = {
    login: (form) => API.post(ApiList.auth.login, form),
    create: (form) => API.post(ApiList.auth.create, form),
    checkAuthorization: () => {
        const token = StorageService.get('token');
        const tokenExpired = StorageService.get('token-expired');

        if (!token || AuthService.isExpired(tokenExpired)) {
            StorageService.set('last-pathname', location.pathname);
            AuthService.logOut();
        }
    },
    isExpired: (expired) => {
        return moment(expired).local().isSameOrBefore(moment());
    },
    logOut: () => {
        StorageService.remove('token');
        StorageService.remove('token-expired');
        EventEmitter.emit('redirect', '/login');
    }
};
