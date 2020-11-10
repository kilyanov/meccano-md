import API from '../api/api';
// import {createURLGenerator} from '../api/apiList';

// const urlGenerator = createURLGenerator('article');
// console.log(urlGenerator);

export const ReprintService = {
    move: ({ params, body }) => {
        return API.post(
            `/article/reprint-move?project=${params.project}&user_type=${params.userType}`,
            body
        );
    }
};
