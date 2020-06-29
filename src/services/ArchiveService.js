import API from '../api/api';
import { createURLGenerator } from '../api/apiList';

const urlGenerator = createURLGenerator('archive');

export const ArchiveService = {
    get: (id = '', form) => API.get(urlGenerator('archive')(id, form)),
    list: (project, startDate, endDate) => {
        return API.get(urlGenerator('archive')(project, { 'date-start': startDate, 'date-end': endDate }));
    },
    delete: (form, projectId) => API.delete(urlGenerator('archive')({ project: projectId }), { data: form }),
    create: (projectId, articlesIds, description = '') => {
        return API.post(urlGenerator('archive')(projectId), { articles: articlesIds, description });
    },
    update: (form, id, userTypeId) => API.put(urlGenerator('archive')(id, { user_type: userTypeId }), form)
};
