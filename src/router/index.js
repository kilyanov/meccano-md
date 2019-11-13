import React from 'react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import AuthRoute from './AuthRoute';

import App from '../components/App';
import HomePage from '../components/Pages/HomePage/HomePage';
import LoginPage from '../components/Pages/LoginPage/LoginPage';
import DocumentsPage from '../components/Documents/DocumentsPage';
import ProjectPage from '../components/Project/ProjectPage/ProjectPage';
import ProjectCreatePage from '../components/Project/ProjectCreatePage/ProjectCreatePage';
import NotFoundPage from '../components/Pages/NotFoundPage/NotFoundPage';
import ArticleCreatePage from '../components/Article/ArticleCeratePage/ArticleCreatePage';
import SettingsPage from '../components/Settings/SettingsPage/SettingsPage';
import SettingsImport from '../components/Settings/SettingsTemplates/SettingsImport/SettingsImport';
import SettingsExport from '../components/Settings/SettingsTemplates/SettingsExport/SettingsExport';
import SettingsCountry from '../components/Settings/SettingsLocation/SettingsCountry';
import SettingsFederal from '../components/Settings/SettingsLocation/SettingsFederal';
import SettingsRegion from '../components/Settings/SettingsLocation/SettingsRegion';
import SettingsCity from '../components/Settings/SettingsLocation/SettingsCity';
import SettingsSourceList from '../components/Settings/SettingsSource/SettingsSourceList';
import SettingsSourceType from '../components/Settings/SettingsSource/SettingsSourceType';
import SettingsAuthors from '../components/Settings/SettingsAuthors/SettingsAuthors';
import UsersPage from "../components/Users/UsersPage";

export default (
    <Router basename='/'>
        <App>
            <Switch>
                <Route exact component={LoginPage} path="/login"/>
                <AuthRoute exact component={HomePage} path="/"/>

                <AuthRoute exact component={ProjectPage} path="/project/:id"/>
                <AuthRoute exact component={ProjectCreatePage} path="/project-create/:id"/>
                <AuthRoute exact component={DocumentsPage} path="/documents/:id?"/>

                <AuthRoute exact component={ArticleCreatePage} path="/project/:projectId/article/:articleId?"/>

                <AuthRoute exact component={SettingsPage} path="/settings"/>

                <AuthRoute exact component={SettingsImport} path="/settings/templates/import"/>
                <AuthRoute exact component={SettingsExport} path="/settings/templates/export"/>

                <AuthRoute exact component={SettingsCountry} path="/settings/location/country"/>
                <AuthRoute exact component={SettingsFederal} path="/settings/location/federal"/>
                <AuthRoute exact component={SettingsRegion} path="/settings/location/region"/>
                <AuthRoute exact component={SettingsCity} path="/settings/location/city"/>

                <AuthRoute exact component={SettingsSourceList} path="/settings/source/list"/>
                <AuthRoute exact component={SettingsSourceType} path="/settings/source/type"/>

                <AuthRoute exact component={SettingsAuthors} path="/settings/authors"/>

                <AuthRoute exact component={UsersPage} path="/users"/>

                <AuthRoute component={NotFoundPage}/>
            </Switch>
        </App>
    </Router>
);
