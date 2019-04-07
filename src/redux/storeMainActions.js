import store from './store';
import {
    getProfile,
    getProjects
} from './actions';

export const storeMainActions = () => {
    store.dispatch(getProfile());
    store.dispatch(getProjects());
};
