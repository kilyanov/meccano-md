import React from 'react';
import {Route, Redirect} from 'react-router-dom';
import {AuthService} from '../services';
import Access from "../components/Shared/Access/Access";
import NotFoundPage from "../components/Pages/NotFoundPage/NotFoundPage";

const AuthRoute = ({...rest}) => (
    AuthService.isAuth() ? <Route {...rest}/> : <Redirect to='/login'/>
);

export default AuthRoute;
