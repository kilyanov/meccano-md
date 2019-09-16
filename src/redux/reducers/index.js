import {combineReducers} from 'redux';
import {profile} from './profile';
import {notificationsPanel} from './notificationsPanel';
import {theme} from './theme';

const reducer = combineReducers({
    profile,
    notificationsPanel,
    theme
});

export default reducer;
