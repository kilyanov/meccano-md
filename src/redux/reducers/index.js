import {combineReducers} from 'redux';
import {profile} from './profile';
import {roles} from './roles';
import {notificationsPanel} from './notificationsPanel';
import {theme} from './theme';
import {settingsMenu} from './settingsMenu';

const reducer = combineReducers({
    profile,
    roles,
    notificationsPanel,
    theme,
    settingsMenu
});

export default reducer;
