import API from '../api/api';

export const ReprintService = {
    move: ({ params, body }) => {
        return API.post(
            `/article/reprint-move?project=${params.project}&user_type=${params.userType}`,
            body
        );
    }
};
