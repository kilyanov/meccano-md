import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import store from './redux/store';
import router from './router';
import ErrorBoundary from "./components/Shared/ErrorBoundary";

moment.locale('ru');

ReactDOM.render(
    <Provider store={store}>
        <ErrorBoundary>
            {router}
        </ErrorBoundary>
    </Provider>,
    document.getElementById('root')
);

module.hot.accept();
