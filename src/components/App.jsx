import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {AuthService, StorageService} from "../services";
import {EventEmitter} from "../helpers";
import {NotificationContainer} from 'react-notifications';
import {Redirect} from 'react-router-dom';
import '../assets/styles/main.scss';
import PromiseDialogModal from './Shared/PromiseDialogModal/PromiseDialogModal';

export default class App extends Component {
    static propTypes = {
        children: PropTypes.node
    };

    state = {
        redirect: false
    };

    componentDidMount() {
        const self = this;
        const localUtcOffset = moment().utcOffset();

        EventEmitter.setMaxListeners(0);
        window.DialogModal = this.dialogModal;
        EventEmitter.on('redirect', (url, callback) => {
            self.setState({redirect: url}, () => {
                self.setState({redirect: false}, callback);
            });
        });

        StorageService.set('local-utc-offset', localUtcOffset);
        AuthService.checkAuthorization();
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
                <PromiseDialogModal ref={node => this.dialogModal = node}/>
            </div>
        );
    }
}
