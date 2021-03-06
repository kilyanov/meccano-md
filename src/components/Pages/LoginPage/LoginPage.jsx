import React, {Component} from 'react';
import {connect} from 'react-redux';
import {AuthService, StorageService} from "../../../services";
import Form from "../../Form/Form/Form";
import Button from "../../Shared/Button/Button";

import './login-page.scss';
import {EventEmitter} from "../../../helpers";
import {EVENTS} from '../../../constants/Events';
import Loader from '../../Shared/Loader/Loader';
import Logo from '../../Shared/Logo/Logo';
import InputText from '../../Form/InputText/InputText';
import {STORAGE_KEY} from '../../../constants/LocalStorageKeys';

class LoginPage extends Component {
    constructor() {
        super();

        if (AuthService.isAuth()) {
            EventEmitter.emit(EVENTS.REDIRECT, '/');
        }
    }

    state = {
        username: '',
        password: '',
        inProgress: false
    };

    handleChangeField = (value, type) => {
        this.setState({[type]: value});
    };

    handleSubmitForm = () => {
        const {username, password} = this.state;

        if (username && password) {
            this.setState({inProgress: true}, () => {
                AuthService
                    .login({username, password})
                    .then(response => {
                        if (response.data.token) {
                            let lastPathName = StorageService.get(STORAGE_KEY.LAST_PATHNAME);

                            if (lastPathName && lastPathName === '/login') lastPathName = '/';

                            EventEmitter.emit(EVENTS.REDIRECT, lastPathName || '/');
                        }
                    })
                    .catch(() => this.setState({inProgress: false}));
            });
        }
    };

    render() {
        const cls = new Bem('login-page');
        const {username, password, inProgress} = this.state;

        return (
            <div {...cls('', '', 'container page')}>
                <div {...cls('logo')}>
                    <Logo/>
                </div>

                <Form
                    {...cls('form')}
                    onSubmit={this.handleSubmitForm}
                >
                    <InputText
                        autoFocus
                        label='??????????'
                        name='login'
                        {...cls('input', 'login')}
                        validateErrorMessage='?????????? ???? ?????????? ???????? ????????????'
                        validateType='notEmpty'
                        value={username}
                        onChange={value => this.handleChangeField(value, 'username')}
                    />

                    <InputText
                        label='????????????'
                        name='password'
                        {...cls('input', 'password')}
                        type='password'
                        onValidate={value => value.length >= 3}
                        validateErrorMessage='???????????? ???? ?????????? ???????? ???????????? 3-?? ??????????????????'
                        value={password}
                        onChange={value => this.handleChangeField(value, 'password')}
                    />

                    <Button
                        {...cls('button', 'submit')}
                        disabled={password.length < 3}
                        onClick={() => {}}
                        text='??????????'
                        style='success'
                        type='submit'
                    />
                </Form>

                {inProgress && <Loader/>}
            </div>
        );
    }
}

export default connect(({countries}) => ({countries}))(LoginPage);
