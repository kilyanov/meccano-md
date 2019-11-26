import store from './store';
import {
    getProfile,
    getRoles,
    getProjects
} from './actions';

export const storeMainActions = () => {
    store.dispatch(getProfile());
    store.dispatch(getRoles());
    store.dispatch(getProjects());
};
