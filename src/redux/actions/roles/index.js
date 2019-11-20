import {ACTION_TYPE} from "../../../constants/ActionTypes";
import {UserService} from '../../../services';

export const getRoles = () => ({
    type: ACTION_TYPE.REQUEST,
    actions: [
        ACTION_TYPE.ROLES.ROLES_LOADING,
        ACTION_TYPE.ROLES.ROLES_LOADED,
        ACTION_TYPE.ROLES.ROLES_LOAD_FAILURE
    ],
    promise: UserService.roles()
});
