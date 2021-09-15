import {ACTION_TYPE} from "../../../constants";
import {UserService} from '../../../services';

export const getUserTypes = () => ({
    type: ACTION_TYPE.REQUEST,
    actions: [
        ACTION_TYPE.USER.TYPES.LOADING,
        ACTION_TYPE.USER.TYPES.LOADED,
        ACTION_TYPE.USER.TYPES.LOAD_FAILURE
    ],
    promise: UserService.types.get()
});
