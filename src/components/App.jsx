import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {AuthService} from "../services";
import {EventEmitter} from "../helpers";
import {NotificationContainer} from 'react-notifications';
import {Redirect} from 'react-router-dom';
import '../assets/styles/main.scss';
import {storeMainActions} from '../redux/storeMainActions';
import {InitScrollbar} from '../helpers/Tools';
import {Push} from '../services/PushService';
import {EVENTS} from '../constants/Events';
import OperatedNotification from './Shared/OperatedNotifiction/OperatedNotification';

export default class App extends Component {
    static propTypes = {
        children: PropTypes.node
    };

    constructor() {
        super();

        const self = this;

        AuthService.checkAuthorization();

        EventEmitter.setMaxListeners(0);
        EventEmitter.on(EVENTS.REDIRECT, (url, callback) => {
            self.setState({redirect: url}, () => {
                self.setState({redirect: false}, callback);
            });
        });

        EventEmitter.on(EVENTS.OPERATED_NOTIFICATION.SHOW, notification => this.setState({notification}));
        EventEmitter.on(EVENTS.OPERATED_NOTIFICATION.HIDE, () => this.setState({notification: null}));
    }

    state = {
        redirect: false,
        notification: null
    };

    componentDidMount() {
        if (AuthService.isAuth()) {
            storeMainActions();
        }

        if (this.containerRef) {
            InitScrollbar(this.bodyRef);
        }

        window.addEventListener('load', () => Push.init());
    }

    componentWillUnmount() {
        EventEmitter.off(EVENTS.REDIRECT, null);
        EventEmitter.off(EVENTS.OPERATED_NOTIFICATION.SHOW, null);
        EventEmitter.off(EVENTS.OPERATED_NOTIFICATION.HIDE, null);
        window.removeEventListener('load', () => {});
    }

    render() {
        const {children} = this.props;
        const {redirect, notification} = this.state;

        return redirect ? (
            <Redirect push to={redirect}/>
        ) : (
            <div className='app' ref={node => this.containerRef = node}>
                {children}
                <NotificationContainer/>

                {notification && (
                    <OperatedNotification
                        /* eslint-disable */
                        onSubmit={notification.onSubmit}
                        onCancel={notification.onCancel}
                        /* eslint-enable */
                        message={notification.message}
                        title={notification.title}
                        submitButtonText={notification.submitButtonText}
                        cancelButtonText={notification.cancelButtonText}
                        type={notification.type}
                        timeOut={notification.timeOut}
                    />
                )}
            </div>
        );
    }
}
