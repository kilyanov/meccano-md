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
        get: (form, id) => API.get(urlGenerator('wordSearch')(form, id)),
        create: form => API.post(urlGenerator('wordSearch')(), form),
        update: (form, id) =>  API.put(urlGenerator('wordSearch')(id), form),
        delete: (form, projectId) => API.delete(urlGenerator('wordSearch')(projectId), {data: form}),
        import: form => API.post(urlGenerator('importWordSearch')(), form)
    },
    field: {
        get: (id) => API.get(urlGenerator('field')(id)),
        create: (form) => API.post(urlGenerator('field')(), form),
        update: (form, id) =>  API.put(urlGenerator('field')(id), form),
        delete: (form, projectId) => API.delete(urlGenerator('field')(projectId), {data: form}),
    }
};
