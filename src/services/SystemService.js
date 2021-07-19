import API from '../api/api';
import ApiList from '../api/apiList';

export const SystemService = {
    logs: (params) => API.get(ApiList.system.logs, { params }),
    clearCache: () => API.post(ApiList.system.clearCache)
};
