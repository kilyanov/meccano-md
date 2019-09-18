import {combineReducers} from 'redux';
import {profile} from './profile';
import {notificationsPanel} from './notificationsPanel';
import {theme} from './theme';
import {settingsMenu} from './settingsMenu';

const reducer = combineReducers({
    profile,
    notificationsPanel,
    theme,
    settingsMenu
});

export default reducer;
