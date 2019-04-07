import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {AuthService} from "../services";
import {EventEmitter} from "../helpers";
import {NotificationContainer} from 'react-notifications';
import {Redirect} from 'react-router-dom';
import '../assets/styles/main.scss';
import {getProfile, getProjects} from '../redux/actions';
import store from '../redux/store';

export default class App extends Component {
    static propTypes = {
        children: PropTypes.node
    };

    constructor() {
        super();

        const self = this;

        AuthService.checkAuthorization();

        EventEmitter.setMaxListeners(0);
        EventEmitter.on('redirect', (url, callback) => {
            self.setState({redirect: url}, () => {
                self.setState({redirect: false}, callback);
            });
        });
    }

    state = {
        redirect: false
    };

    componentDidMount() {
        if (AuthService.isAuth()) {
            store.dispatch(getProfile());
            store.dispatch(getProjects());
        }
    }

    componentWillUnmount() {
        EventEmitter.off('redirect');
    }

    render() {
        const {redirect} = this.state;
        const {children} = this.props;

        return redirect ? (
            <Redirect push to={redirect}/>
        ) : (
            <div className='app'>
                {children}
                <NotificationContainer/>
            </div>
        );
    }
}
