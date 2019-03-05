import React, {Component} from 'react';
import {connect} from 'react-redux';
import {AuthService, StorageService} from "../../../services";
import Form from "../../Form/Form/Form";
import FormInputText from "../../Form/FormInputText/FormInputText";
import Button from "../../Shared/Button/Button";

import './style.scss';
import {EventEmitter} from "../../../helpers";
import Loader from '../../Shared/Loader/Loader';

class LoginPage extends Component {
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
                            let lastPathName = StorageService.get('last-pathname');

                            if (lastPathName && lastPathName === '/login') lastPathName = '/';

                            StorageService.set('token', response.data.token);
                            StorageService.set('token-expired', response.data.expired);

                            EventEmitter.emit('redirect', lastPathName || '/');
                        }
                    })
                    .catch(() => this.setState({inProgress: false}));
            });
        }
    };

    render() {
        const classes = new Bem('login-page');
        const {username, password, inProgress} = this.state;

        return (
            <div {...classes('', '', 'container page')}>
                <h1 {...classes('title')}>Авторизация</h1>

                <Form
                    {...classes('form')}
                    onSubmit={this.handleSubmitForm}
                >
                    <FormInputText
                        label='Логин'
                        name='login'
                        {...classes('input', 'login')}
                        validateErrorMessage='Логин не может быть пустым'
                        validateType='notEmpty'
                        value={username}
                        onChange={value => this.handleChangeField(value, 'username')}
                    />

                    <FormInputText
                        label='Пароль'
                        name='password'
                        {...classes('input', 'password')}
                        type='password'
                        onValidate={value => value.length >= 3}
                        validateErrorMessage='Пароль не может быть меньше 6-ти симоволов'
                        value={password}
                        onChange={value => this.handleChangeField(value, 'password')}
                    />

                    <Button
                        {...classes('button', 'submit')}
                        disabled={password.length < 3}
                        onClick={() => {}}
                        text='Авторизоваться'
                        type='submit'
                    />
                </Form>

                <Button
                    text='Нет аккаунта?'
                    to='/registration'
                    style='inline'
                />

                {inProgress && <Loader/>}
            </div>
        );
    }
}

export default connect(({countries}) => ({countries}))(LoginPage);
