import API from '../api/api';
import ApiList from '../api/apiList';
import { StorageService } from "./StorageService";
import { EventEmitter } from "../helpers";
import { storeMainActions } from '../redux/storeMainActions';
import {STORAGE_KEY} from '../constants/LocalStorageKeys';
import {EVENTS} from '../constants/Events';

export const AuthService = {
    login: (form) => {
        return API
            .post(ApiList.auth.login, form)
            .then(response => {
                StorageService.set(STORAGE_KEY.TOKEN, response.data.token);
                StorageService.set(STORAGE_KEY.TOKEN_EXPIRED, response.data.expired);
                API.setToken(response.data.token);
                storeMainActions();

                return response;
            });
    },
    checkAuthorization: () => {
        const token = StorageService.get(STORAGE_KEY.TOKEN);
        const tokenExpired = StorageService.get(STORAGE_KEY.TOKEN_EXPIRED);

        if (token) {
            API.setToken(token);
        }

        if (!token || AuthService.isExpired(tokenExpired)) {
            StorageService.set(STORAGE_KEY.LAST_PATHNAME, location.pathname);
            AuthService.logOut();
        }
    },
    isAuth: () => {
        const token = StorageService.get(STORAGE_KEY.TOKEN);
        const tokenExpired = StorageService.get(STORAGE_KEY.TOKEN_EXPIRED);

        return token && !AuthService.isExpired(tokenExpired);
    },
    isExpired: (expired) => {
        return moment(expired).local().isSameOrBefore(moment());
    },
    logOut: () => {
        StorageService.remove(STORAGE_KEY.TOKEN);
        StorageService.remove(STORAGE_KEY.TOKEN_EXPIRED);
        API.removeToken();
        EventEmitter.emit(EVENTS.REDIRECT, '/login');
    }
};
