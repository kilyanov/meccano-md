import store from './store';
import {getProfile, getRoles} from './actions';

export const storeMainActions = () => {
    store.dispatch(getProfile());
    store.dispatch(getRoles());
};
