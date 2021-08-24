import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import store from './redux/store';
import router from './router';
import ErrorBoundary from "./components/Shared/ErrorBoundary";
import { createTheme, ThemeProvider } from '@material-ui/core/styles';
import meccanoTheme from './theme';

const theme = createTheme(meccanoTheme);

moment.locale('ru');

ReactDOM.render(
    <Provider store={store}>
        <ThemeProvider theme={theme}>
            <ErrorBoundary>
                {router}
            </ErrorBoundary>
        </ThemeProvider>
    </Provider>,
    document.getElementById('root')
);

module.hot.accept();
