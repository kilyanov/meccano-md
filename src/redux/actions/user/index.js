import types from "../../../constants/ActionTypes";
import UserService from '../../../services/UserService';

export const getProfile = () => ({
    type: types.REQUEST,
    actions: [
        types.user.profile.PROFILE_LOADING,
        types.user.profile.PROFILE_LOADED,
        types.user.profile.PROFILE_LOAD_FAILURE
    ],
    promise: UserService.getProfile()
});
