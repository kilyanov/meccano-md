import API from '../api/api';
import ApiList, {createURLGenerator} from '../api/apiList';
import {ParseToRequest} from '../helpers/Tools';
import axios from 'axios';

const CancelToken = axios.CancelToken;
const urlGenerator = createURLGenerator('project');
// const url = urlGenerator('project');

let source;

export const ProjectService = {
    get: (params, id = '') => {
        source = CancelToken.source();
        return API.get(urlGenerator('project')(params, id));
    },
    delete: (id) => API.delete(urlGenerator('project')(id)),
    post: (form) => API.post(urlGenerator('project')(), form),
    put: (id, form) => {
        source = CancelToken.source();
        return API.put(urlGenerator('project')(id), form);
    },
    importArticles: (projectId, form) => API.post(`${ApiList.project.project}/${projectId}/import`, form),
    sections: {
        get: (project) => API.get(urlGenerator('sections')({project})),
        create: (project, form) => API.post(urlGenerator('sections')({project}), form),
        update: (project, form) => API.put(urlGenerator('sections')({project}), form)
    },
    getSections: (project) => API.get(`${ApiList.project.sections}${ParseToRequest({project})}`),
    createSections: (project, form) => API.post(`${ApiList.project.sections}${ParseToRequest({project})}`, form),
    getFields: (project) => API.get(`${ApiList.project.fieldValue}?id=${project}`),
    cancelLast: () => source && source.cancel('Operation canceled by the user.'),
    wordSearch: {
        get: (form, projectId, id = '') => API.get(`/project/${projectId}/word-search${id}`, { params: form }),
        create: (form, projectId) => API.post(`/project/${projectId}/word-search`, form),
        update: (form, projectId, id) =>  API.put(`/project/${projectId}/word-search/${id}`, form),
        delete: (form, projectId) => API.delete(`/project/${projectId}/word-search`, {data: form}),
        import: (form, projectId) => API.post(`/project/${projectId}/word-search/import`, form)
    },
    wordSetting: {
        get: (projectId, form) => API.get(`/project/${projectId}/word-setting`, { params: form }),
        create: (projectId, form) => API.post(`/project/${projectId}/word-setting`, form),
        update: (projectId, form) => API.put(`/project/${projectId}/word-setting`, form)
    },
    field: {
        get: (id) => API.get(urlGenerator('field')(id)),
        create: (form) => API.post(urlGenerator('field')(), form),
        update: (form, id) =>  API.put(urlGenerator('field')(id), form),
        delete: (form, projectId) => API.delete(urlGenerator('field')(projectId), {data: form})
    },
    updateMany: (form, projectId) => API.put(`${ApiList.project.project}/${projectId}/update-many`, form)
};
