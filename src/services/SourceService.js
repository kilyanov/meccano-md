import API from '../api/api';
import ApiList, {createURLGenerator} from '../api/apiList';
import axios from 'axios';

const CancelToken = axios.CancelToken;
const urlGenerator = createURLGenerator('source');
const url = urlGenerator('source');

let source;

export const SourceService = {
    get: (form, id) => {
        source = CancelToken.source();
        return API.get(url(form, id), {cancelToken: source.token});
    },
    cancelLast: () => source && source.cancel('Operation canceled by the user.'),
    delete: (id) => API.delete(url(id)),
    create: (form) => API.post(url(), form),
    update: (form, id) => API.put(url(id), form),
    type: {
        get: (form, id) => {
            const typeUrl = urlGenerator('type');

            source = CancelToken.source();
            return API.get(typeUrl(form, id), {
                cancelToken: source.token
            });
        },
        create: (form) => API.post(ApiList.source.type, form),
        update: (form, id) => API.put(`${ApiList.source.type}/${id}`, form),
        delete: (id) => API.delete(`${ApiList.source.type}/${id}`)
    }
};
