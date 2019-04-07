import {applyMiddleware, compose, createStore} from 'redux';
import {createLogger} from 'redux-logger';
import requestMiddleware from './middleware/request';
import reducers from './reducers';

const logger = createLogger();
const initialState = {
    articles: [],
    profile: {},
    projects: []
};

/* eslint-disable no-underscore-dangle */
const composeEnhancers =
    process.env.NODE_ENV !== 'production' &&
    typeof window === 'object' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
        window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({}) : compose;
/* eslint-enable */

const middleware = applyMiddleware(requestMiddleware, logger);
const store = createStore(reducers, initialState, composeEnhancers(middleware));

export default store;
