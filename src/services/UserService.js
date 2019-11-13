import API from '../api/api';
import ApiList from '../api/apiList';

export default {
    get: () => API.get(ApiList.user.user),
    getProfile: () => API.get(ApiList.user.profile)
};
