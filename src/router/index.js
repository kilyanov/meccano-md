import React from 'react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import AuthRoute from './AuthRoute';
import {PERMISSION} from "../constants";

import App from '../components/App';
import HomePage from '../components/Pages/HomePage/HomePage';
import LoginPage from '../components/Pages/LoginPage/LoginPage';
import DocumentsPage from '../components/Documents/DocumentsPage';
import ProjectPage from '../components/Project/ProjectPage/ProjectPage';
import ProjectComparePage from '../components/Project/ProjectComparePage/ProjectComparePage';
import ProjectCreatePage from '../components/Project/ProjectCreatePage/ProjectCreatePage';
import NotFoundPage from '../components/Pages/NotFoundPage/NotFoundPage';
import ArticlePage from '../components/Article/ArticlePage';
import SettingsPage from '../components/Settings/SettingsPage/SettingsPage';
import SettingsImport from '../components/Settings/SettingsTemplates/SettingsImport/SettingsImport';
import SettingsExport from '../components/Settings/SettingsTemplates/SettingsExport/SettingsExport';
import SettingsCountry from '../components/Settings/SettingsLocation/LocationCountry/SettingsCountry';
import SettingsFederal from '../components/Settings/SettingsLocation/LocationFederal/SettingsFederal';
import SettingsRegion from '../components/Settings/SettingsLocation/LocationRegion/SettingsRegion';
import SettingsCity from '../components/Settings/SettingsLocation/LocationCity/SettingsCity';
import SettingsSourceList from '../components/Settings/SettingsSource/SettingsSourceList';
import SettingsSourceType from '../components/Settings/SettingsSource/SettingsSourceType';
import SettingsSourceCategory from '../components/Settings/SettingsSource/SettingsSourceCategory';
import SettingsAuthors from '../components/Settings/SettingsAuthors/SettingsAuthors';
import SettingsSystem from "../components/Settings/SettingsSystem/SettingsSystem";
import UsersPage from "../components/Users/UsersPage";
import ArchivePage from "../components/Archive/ArchivePage";
import ArchiveArticlePage from "../components/Archive/ArchiveArticlePage";
import Logs from '../components/Settings/SettingsSystem/Logs/Logs';
import ProjectSort from '../components/Project/ProjectSort';

export default (
    <Router basename='/'>
        <App>
            <Switch>
                <Route exact component={LoginPage} path="/login"/>
                <AuthRoute exact component={HomePage} path="/"/>

                <AuthRoute exact component={ProjectPage} path="/project/:id"/>
                <AuthRoute exact component={ProjectSort} path="/project/:id/sort"/>
                <AuthRoute exact component={ProjectComparePage} path="/project/:id/compare"/>
                <AuthRoute exact component={ArchivePage} path="/archive/:projectId/:id"/>
                <AuthRoute exact component={ArticlePage} path="/project/:projectId/article/:articleId?"/>
                <AuthRoute exact component={ArchiveArticlePage} path="/archive/:archiveId/article/:articleId?"/>
                <AuthRoute
                    exact
                    permissions={[PERMISSION.createProject]}
                    component={ProjectCreatePage}
                    path="/project-create/:id"
                />

                <AuthRoute
                    exact
                    permissions={[PERMISSION.viewDocuments, PERMISSION.editDocuments]}
                    component={DocumentsPage}
                    path="/documents/:id?"
                />

                <AuthRoute
                    exact
                    permissions={[PERMISSION.viewSettings, PERMISSION.editSettings]}
                    component={SettingsPage}
                    path="/settings"
                />
                <AuthRoute
                    exact
                    permissions={[PERMISSION.viewSettings, PERMISSION.editSettings]}
                    component={SettingsSystem}
                    path="/settings/system"
                />
                <AuthRoute
                    exact
                    permissions={[PERMISSION.viewSettings, PERMISSION.editSettings]}
                    component={SettingsImport}
                    path="/settings/templates/import"
                />
                <AuthRoute
                    exact
                    permissions={[PERMISSION.viewSettings, PERMISSION.editSettings]}
                    component={SettingsExport}
                    path="/settings/templates/export"
                />
                <AuthRoute
                    exact
                    permissions={[PERMISSION.viewSettings, PERMISSION.editSettings]}
                    component={SettingsCountry}
                    path="/settings/location/country"
                />
                <AuthRoute
                    exact
                    permissions={[PERMISSION.viewSettings, PERMISSION.editSettings]}
                    component={SettingsFederal}
                    path="/settings/location/federal"
                />
                <AuthRoute
                    exact
                    permissions={[PERMISSION.viewSettings, PERMISSION.editSettings]}
                    component={SettingsRegion}
                    path="/settings/location/region"
                />
                <AuthRoute
                    exact
                    permissions={[PERMISSION.viewSettings, PERMISSION.editSettings]}
                    component={SettingsCity}
                    path="/settings/location/city"
                />
                <AuthRoute
                    exact
                    permissions={[PERMISSION.viewSettings, PERMISSION.editSettings]}
                    component={SettingsSourceList}
                    path="/settings/source/list"
                />
                <AuthRoute
                    exact
                    permissions={[PERMISSION.viewSettings, PERMISSION.editSettings]}
                    component={SettingsSourceType}
                    path="/settings/source/type"
                />
                <AuthRoute
                    exact
                    permissions={[PERMISSION.viewSettings, PERMISSION.editSettings]}
                    component={SettingsSourceCategory}
                    path="/settings/source/category"
                />
                <AuthRoute
                    exact
                    permissions={[PERMISSION.viewSettings, PERMISSION.editSettings]}
                    component={SettingsAuthors}
                    path="/settings/authors"
                />
                <AuthRoute
                    exact
                    permissions={[PERMISSION.viewSettings, PERMISSION.editSettings]}
                    component={Logs}
                    path="/settings/system/logs"
                />

                <AuthRoute
                    exact
                    permissions={[PERMISSION.viewUsers, PERMISSION.editUsers]}
                    component={UsersPage}
                    path="/users"
                />

                <AuthRoute component={NotFoundPage}/>
            </Switch>
        </App>
    </Router>
);
