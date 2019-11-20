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

        if (!axios.isCancel(error) && _.get(response, 'data', []).length || response.status >= 400) {
            const data = response.data instanceof ArrayBuffer ? arrayBufferToArray(response.data) : response.data;

            console.log(data);
            data.forEach(msg => Notify.error(msg.message, 'Ошибка'));
        }

        return Promise.reject(error.response);
    }
);

function arrayBufferToArray(data) {
    const array = new Uint8Array(data);
    const len = array.length;
    let out = '';
    let i = 0;
    let c;
    let char2;
    let char3;

    while (i < len) {
        c = array[i++];

        switch (c >> 4) {
            case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
                // 0xxxxxxx
                out += String.fromCharCode(c);
                break;
            case 12: case 13:
                // 110x xxxx   10xx xxxx
                char2 = array[i++];
                /* eslint-disable-next-line */
                out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
                break;
            case 14:
                // 1110 xxxx  10xx xxxx  10xx xxxx
                char2 = array[i++];
                char3 = array[i++];
                /* eslint-disable */
                out += String.fromCharCode(((c & 0x0F) << 12) |
                    /* eslint-disable-next-line */
                    ((char2 & 0x3F) << 6) |
                    ((char3 & 0x3F) << 0));
                /* eslint-enable */
                break;
            default:
                break;
        }
    }

    return [JSON.parse(out)];
}

export default httpService;
