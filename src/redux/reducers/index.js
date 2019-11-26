import {combineReducers} from 'redux';
import {profile} from './profile';
import {roles} from './roles';
import {notificationsPanel} from './notificationsPanel';
import {theme} from './theme';
import {settingsMenu} from './settingsMenu';
import {projects} from './project';
import {documents} from './document';

const reducer = combineReducers({
    profile,
    roles,
    notificationsPanel,
    theme,
    settingsMenu,
    projects,
    documents
});

export default reducer;
