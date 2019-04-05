import API from '../api/api';
import ApiList from '../api/apiList';

export default {
    getProfile: () => API.get(ApiList.user.profile)
};
