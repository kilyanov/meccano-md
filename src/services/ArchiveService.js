import API from '../api/api';
import { createURLGenerator } from '../api/apiList';

const urlGenerator = createURLGenerator('archive');

export const ArchiveService = {
    get: (projectId = '', id = '', form) => API.get(`/archive/${projectId}/${id}`, { params: form }),
    list: (project, startDate, endDate) => {
        return API.get(urlGenerator('archive')(project, { 'date-start': startDate, 'date-end': endDate }));
    },
    delete: (form, projectId) => API.delete(urlGenerator('archive')({ project: projectId }), { data: form }),
    create: (projectId, articlesIds, description = '') => {
        return API.post(urlGenerator('archive')(projectId), { articles: articlesIds, description });
    },
    update: (form, id, userTypeId) => API.put(urlGenerator('archive')(id, { user_type: userTypeId }), form),
    articles: {
        list: (archiveId, form) => API.get(`/archive/${archiveId}/article`, { params: form } ),
        get: (archiveId, articleId, form) => API.get(`/archive/${archiveId}/article/${articleId}`, { params: form } )
    },
    getArticles: (archiveId, form) => API.get(`/archive/${archiveId}/article`, { params: form } )
};
