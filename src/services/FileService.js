import API from '../api/api';
import {createURLGenerator} from '../api/apiList';

const urlGenerator = createURLGenerator('file');

export const FileService = {
    download: (form) => API.post(urlGenerator('download')(form), {}, {responseType: 'arraybuffer'})
};
