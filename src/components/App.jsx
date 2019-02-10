import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Redirect} from 'react-router-dom';
import EventEmitter from '../helpers/EventEmitter';
import '../assets/styles/main.scss';

export default class App extends Component {
    static propTypes = {
        children: PropTypes.node
    };

    state = {
        redirect: false
    };

    componentDidMount() {
        const self = this;

        EventEmitter.setMaxListeners(0);
        EventEmitter.on('redirect', (url, callback) => {
            self.setState({redirect: url}, () => {
                self.setState({redirect: false}, callback);
            });
        });
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
            <div className='app'>{children}</div>
        );
    }
}
