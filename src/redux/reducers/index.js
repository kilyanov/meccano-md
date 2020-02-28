import {combineReducers} from 'redux';
import {profile} from './profile';
import {roles} from './roles';
import {notificationsPanel} from './notificationsPanel';
import {theme} from './theme';
import {settingsMenu} from './settingsMenu';
import {projects} from './project';
import {documents} from './document';
import {userTypes} from './userType';
import {currentProject} from './currentProject';
import {articleColors} from './articleColors';
import {ACTION_TYPE, STORAGE_KEY} from "../../constants";
import {initialState} from "../store";
import {StorageService} from "../../services";

const appReducer = combineReducers({
    profile,
    roles,
    notificationsPanel,
    theme,
    settingsMenu,
    projects,
    documents,
    userTypes,
    currentProject,
    articleColors
});

const rootReducer = (state, action) => {
    let newState = state;

    if (action.type === ACTION_TYPE.USER.LOGOUT) {
        const userTheme = StorageService.get(STORAGE_KEY.THEME) || initialState.theme;

        newState = {...initialState, theme: userTheme};
    }

    return appReducer(newState, action);
};

export default rootReducer;
