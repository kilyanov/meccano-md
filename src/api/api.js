import axios from 'axios';
import config from '../config/local';

export default axios.create({
    baseURL: config.apiURL
});
