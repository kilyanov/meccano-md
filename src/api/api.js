import axios from 'axios';
import config from '../config/';

export default axios.create({
    baseURL: config.apiURL,
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
});
