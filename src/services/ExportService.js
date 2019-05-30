import API from '../api/api';
import config from '../config/';
import ApiList from '../api/apiList';

export const ExportService = {
    xlsx: (projectId) => API.get(`${ApiList.export.xlsx}?projectId=${projectId}`),
    getLink: (projectId) => `${config.apiURL}${ApiList.export.xlsx}?projectId=${projectId}`
};
