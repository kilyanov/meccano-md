import axios from 'axios';
import { AuthService } from "../services";
import { Notify } from '../helpers';

const options = {
    baseURL: process.env.HOST,
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
            console.error('Unauthorized, logging out...');
            AuthService.logOut();
        }

        if (!axios.isCancel(error) && response?.data?.length || response?.status >= 400) {
            const data = response.data instanceof ArrayBuffer
                ? arrayBufferToArray(response.data)
                : response.data;

            if (Array.isArray(data)) {
                data.forEach(msg => Notify.error(msg.message, 'Ошибка'));
            }

            if (_.isObject(data) && !Array.isArray(data)) {
                Notify.error(data.message, 'Ошибка');
            }
        }

        return Promise.reject(response);
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

        /* eslint-disable */
        switch (c >> 4) {
            case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
                // 0xxxxxxx
                out += String.fromCharCode(c);
                break;
            case 12: case 13:
                // 110x xxxx   10xx xxxx
                char2 = array[i++];
                out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
                break;
            case 14:
                // 1110 xxxx  10xx xxxx  10xx xxxx
                char2 = array[i++];
                char3 = array[i++];
                out += String.fromCharCode(((c & 0x0F) << 12) |
                    ((char2 & 0x3F) << 6) |
                    ((char3 & 0x3F) << 0));
                break;
            default:
                break;
        }
        /* eslint-enable */
    }

    return [JSON.parse(out)];
}

export default httpService;
