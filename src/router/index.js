import React from 'react';
import {BrowserRouter as Router, Route} from 'react-router-dom';

import App from '../components/App';
import LoginPage from '../components/Pages/LoginPage/LoginPage';
import RegisterPage from '../components/Pages/RegisterPage/RegisterPage';

export default (
    <Router>
        <App>
            <Route exact component={LoginPage} path="/"/>
            <Route exact component={RegisterPage} path="/registration"/>
        </App>
    </Router>
);
