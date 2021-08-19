import { ACTION_TYPE } from '../../../constants';

export const setUserType = (payload) => ({
    type: ACTION_TYPE.USER.TYPE.SET,
    payload
});
