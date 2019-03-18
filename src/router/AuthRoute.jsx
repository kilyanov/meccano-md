import React from 'react';
import {Route, Redirect} from 'react-router-dom';
import {AuthService} from '../services';

const AuthRoute = ({...rest}) => (
    AuthService.isAuth() ? <Route {...rest}/> : <Redirect to='/login'/>
);

export default AuthRoute;
