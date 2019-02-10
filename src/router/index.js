import React from 'react';
import {BrowserRouter as Router, Route} from 'react-router-dom';

import App from '../components/App';
import LoginPage from '../components/Pages/LoginPage/LoginPage';

export default (
    <Router>
        <App>
            <Route exact path="/" component={LoginPage}/>
        </App>
    </Router>
);
