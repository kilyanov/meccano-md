import store from './store';
import {getProfile} from './actions';

export const storeMainActions = () => {
    store.dispatch(getProfile());
};
