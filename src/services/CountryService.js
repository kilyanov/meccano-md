import API from '../api/api';
import ApiList from '../api/apiList';

export default {
    getCountries: () => API.get(ApiList.country)
};
