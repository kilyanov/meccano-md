import axios from 'axios';
import config from '../config/';
import {AuthService, StorageService} from "../services";

const token = StorageService.get('token');
const httpService = axios.create({
    baseURL: config.apiURL,
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Authorization': `Bearer ${token}`
    }
});

httpService.interceptors.response.use(
    response => response,
    error => {
        if (error.response.status === 401) {
            console.error('unauthorized, logging out ...');
            AuthService.logOut();
        }

        return Promise.reject(error.response);
    }
);

export default httpService;
