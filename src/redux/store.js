import {applyMiddleware, compose, createStore} from 'redux';
import requestMiddleware from './middleware/request';
import reducers from './reducers';
import {THEME_TYPE} from '../constants';

// const logger = createLogger();
export const initialState = {
    appProgress: {
        inProgress: false,
        withBlockedOverlay: false
    },
    documents: [],
    projects: [],
    currentProject: null,
    articleColors: [],
    profile: {},
    roles: [],
    notificationsPanel: {
        projects: [],
        documents: [],
        notifications: [],
        settingsMenu: {
            open: false
        },
        open: false
    },
    theme: THEME_TYPE.LIGHT
};

/* eslint-disable no-underscore-dangle */
const composeEnhancers =
    process.env.NODE_ENV !== 'production' &&
    typeof window === 'object' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
        window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({}) : compose;
/* eslint-enable */

const middleware = applyMiddleware(requestMiddleware); // , logger
const store = createStore(reducers, initialState, composeEnhancers(middleware));

export default store;
