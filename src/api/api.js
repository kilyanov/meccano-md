import axios from 'axios';
import config from '../config/';
import {AuthService} from "../services";
import {Notify} from '../helpers';

const options = {
    baseURL: config.apiURL,
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'withCredentials': true
    }
};

const httpService = axios.create(options);

httpService.setToken = (token) => {
    httpService.defaults.headers.Authorization = `Bearer ${token}`;
};

httpService.removeToken = () => {
    httpService.defaults.headers.Authorization = '';
};

httpService.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            console.error('unauthorized, logging out ...');
            AuthService.logOut();
        }

        if (!axios.isCancel(error) && error.message) {
            Notify.error(error.message, 'Ошибка');
        }

        return Promise.reject(error.response);
    }
);

export default httpService;
