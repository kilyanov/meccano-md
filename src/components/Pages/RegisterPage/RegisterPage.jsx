import React, {Component} from 'react';
import {Link} from "react-router-dom";
import './register-page.scss';
import AuthService from "../../../services/AuthService";
import Form from "../../Form/Form/Form";
import FormInputText from "../../Form/FormInputText/FormInputText";
import Button from "../../Shared/Button/Button";

export default class RegisterPage extends Component {
    state = {
        username: '',
        password: '',
        email: '',
        inProgress: false
    };

    handleChangeField = (value, type) => {
        this.setState({[type]: value});
    };

    handleSubmitForm = () => {
        const {username, password, email} = this.state;
        const form = {username, password, email};

        if (form) {
            this.setState({inProgress: true}, () => {
                AuthService
                    .create(form)
                    .then(response => {
                        console.log(response);
                        this.setState({inProgress: false});
                    })
                    .catch(() => this.setState({inProgress: false}));
            });
        }
    };

    render() {
        const classes = new Bem('register-page');
        const {username, password, email} = this.state;

        return (
            <div {...classes('', '', 'page')}>
                <h1>Регистрация</h1>

                <Form
                    {...classes('form')}
                    onSubmit={this.handleSubmitForm}
                >
                    <FormInputText
                        placeholder='Имя пользователя'
                        {...classes('input')}
                        value={username}
                        onChange={value => this.handleChangeField(value, 'login')}
                    />

                    <FormInputText
                        placeholder='Почта'
                        {...classes('input')}
                        type='email'
                        value={email}
                        onChange={value => this.handleChangeField(value, 'email')}
                    />

                    <FormInputText
                        placeholder='Пароль'
                        {...classes('input')}
                        type='password'
                        value={password}
                        onChange={value => this.handleChangeField(value, 'password')}
                    />

                    <Button
                        {...classes('button', 'submit')}
                        disabled={password.length < 3}
                        text='Зарегистрироваться'
                        type='submit'
                    />
                </Form>

                <Link to='/'>Есть аккаунт?</Link>
            </div>
        );
    }
}
