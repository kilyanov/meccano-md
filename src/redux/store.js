import {applyMiddleware, compose, createStore} from 'redux';
import {createLogger} from 'redux-logger';
import requestMiddleware from './middleware/request';
import reducers from './reducers';

const logger = createLogger();
const initialState = {
    articles: [],
    profile: {},
    projects: [],
    city: [],
    country: [],
    federal: [],
    region: [],
    source: [],
    notificationsPanel: {
        notifications: [
            {id: '1', title: 'Уведомление', message: 'Болльшой текст уведомления'},
            {id: '2', title: 'Экспорт статей', message: 'Идет экспорт статей проекта "Первый"'},
            {id: '3', title: 'Импорт статей', message: 'Идет импорт статей в проект "Первый"'}
        ],
        open: false
    }
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
