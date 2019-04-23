import React from 'react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import AuthRoute from './AuthRoute';

import App from '../components/App';
import HomePage from '../components/Pages/HomePage/HomePage';
import LoginPage from '../components/Pages/LoginPage/LoginPage';
import ProjectPage from '../components/Pages/ProjectPage/ProjectPage';
import ProjectCreatePage from '../components/Project/ProjectCreatePage/ProjectCreatePage';
import NotFoundPage from '../components/Pages/NotFoundPage/NotFoundPage';

export default (
    <Router>
        <App>
            <Switch>
                <Route exact component={LoginPage} path="/login"/>
                <AuthRoute exact component={HomePage} path="/"/>
                <AuthRoute exact component={ProjectPage} path="/project/:id"/>
                <AuthRoute exact component={ProjectCreatePage} path="/project-create/:id/:step"/>

                <AuthRoute component={NotFoundPage}/>
            </Switch>
        </App>
    </Router>
);
