import API from '../api/api';
import ApiList from '../api/apiList';
import {ParseToRequest} from '../helpers/Tools';

export const LocationService = {
    country: {
        get: (id = '', form) => API.get(`${ApiList.country}${id ? `/${id}` : ''}${ParseToRequest(form)}`),
        delete: (id) => API.delete(`${ApiList.country}/${id}`),
        create: (form) => API.post(ApiList.country, form),
        update: (form, id) => API.put(`${ApiList.country}/${id}`, form)
    },
    federal: {
        get: (id = '', form) => API.get(`${ApiList.federal}${id ? `/${id}` : ''}${ParseToRequest(form)}`),
        delete: (id) => API.delete(`${ApiList.federal}/${id}`),
        create: (form) => API.post(ApiList.federal, form),
        update: (form, id) => API.put(`${ApiList.federal}/${id}`, form)
    },
    region: {
        get: (id = '', form) => API.get(`${ApiList.region}${id ? `/${id}` : ''}${ParseToRequest(form)}`),
        delete: (id) => API.delete(`${ApiList.region}/${id}`),
        create: (form) => API.post(ApiList.region, form),
        update: (form, id) => API.put(`${ApiList.region}/${id}`, form)
    },
    city: {
        get: (id = '', form) => API.get(`${ApiList.city}${id ? `/${id}` : ''}${ParseToRequest(form)}`),
        delete: (id) => API.delete(`${ApiList.city}/${id}`),
        create: (form) => API.post(ApiList.city, form),
        update: (form, id) => API.put(`${ApiList.city}/${id}`, form)
    }
};
