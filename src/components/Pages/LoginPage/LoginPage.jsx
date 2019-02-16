import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';
import AuthService from "../../../services/AuthService";
import store from '../../../redux/store';
import {getCountries} from "../../../redux/actions/country";
import Form from "../../Form/Form/Form";
import FormInputText from "../../Form/FormInputText/FormInputText";
import Button from "../../Shared/Button/Button";

import './login-page.scss';

class LoginPage extends Component {
    state = {
        username: '',
        password: '',
        inProgress: false
    };

    componentDidMount() {
        store.dispatch(getCountries());
    }

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
                        console.log(response);
                        this.setState({inProgress: false});
                    })
                    .catch(() => this.setState({inProgress: false}));
            });
        }
    };

    render() {
        const classes = new Bem('login-page');
        const {username, password} = this.state;

        return (
            <div {...classes('', '', 'page')}>
                <h1>Авторизация</h1>

                <Form
                    {...classes('form')}
                    onSubmit={this.handleSubmitForm}
                >
                    <FormInputText
                        placeholder='Логин'
                        {...classes('input')}
                        value={username}
                        onChange={value => this.handleChangeField(value, 'username')}
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
                        text='Авторизоваться'
                        type='submit'
                    />
                </Form>

                <Link to='/registration'>Нет аккаунта?</Link>
            </div>
        );
    }
}

export default connect(({countries}) => ({countries}))(LoginPage);
