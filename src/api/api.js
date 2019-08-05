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
        const response = error.response;

        if (response && response.status === 401) {
            console.error('unauthorized, logging out ...');
            AuthService.logOut();
        }

        if (!axios.isCancel(error) && _.get(response, 'data', []).length) {
            response.data.forEach(msg => Notify.error(msg.message, 'Ошибка'));
        }

        return Promise.reject(error.response);
    }
);

export default httpService;
