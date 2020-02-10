import {ACTION_TYPE} from "../../../constants/ActionTypes";
import {UserService} from '../../../services';

export const getProfile = () => ({
    type: ACTION_TYPE.REQUEST,
    actions: [
        ACTION_TYPE.PROFILE.PROFILE_LOADING,
        ACTION_TYPE.PROFILE.PROFILE_LOADED,
        ACTION_TYPE.PROFILE.PROFILE_LOAD_FAILURE
    ],
    promise: UserService.getProfile()
});

export const userLogout = () => ({type: ACTION_TYPE.USER.LOGOUT});
