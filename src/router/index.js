import React from 'react';
import {BrowserRouter as Router, Route} from 'react-router-dom';

import App from '../components/App';
import HomePage from '../components/Pages/HomePage/HomePage';
import LoginPage from '../components/Pages/LoginPage/LoginPage';
import NotFoundPage from '../components/Pages/NotFoundPage/NotFoundPage';

export default (
    <Router>
        <App>
            <Route exact component={HomePage} path="/"/>
            <Route exact component={LoginPage} path="/login"/>

            <Route component={NotFoundPage}/>
        </App>
    </Router>
);
