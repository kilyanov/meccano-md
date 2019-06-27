import API from '../api/api';
import ApiList from '../api/apiList';
import {ParseToRequest} from '../helpers/Tools';

export default {
    import: {
        get: (id = '', form) => API.get(`${ApiList.transfer.import}${id ? `/${id}` : ''}${ParseToRequest(form)}`),
        set: (form) => API.post(ApiList.transfer.import, form),
        delete: (id) => API.delete(`${ApiList.transfer.import}/${id}`),
        update: (form, id) => API.put(`${ApiList.transfer.import}/${id}`, form)
    },
    export: {
        get: (id = '', form) => API.get(`${ApiList.transfer.export}${id ? `/${id}` : ''}${ParseToRequest(form)}`),
        set: (form) => API.post(ApiList.transfer.export, form, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }),
        delete: (id) => API.delete(`${ApiList.transfer.export}/${id}`),
        update: (form, id) => API.put(`${ApiList.transfer.export}/${id}`, form, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    },
    type: {
        get: () =>  API.get(ApiList.transfer.type)
    }
};
