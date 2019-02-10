import React, {Component} from 'react';
import './login-page.scss';

export default class LoginPage extends Component {
    render() {
        const classes = new Bem('login-page');

        return (
            <div {...classes('', '', 'page')}>
                <form {...classes('form')}>
                    <input
                        {...classes('input')}
                        type='text'
                        name='login'
                    />
                    <input
                        {...classes('input')}
                        type='password'
                        name='password'
                    />

                    <button
                        {...classes('button', 'submit')}
                        type='submit'
                    >Авторизоваться</button>
                </form>
            </div>
        );
    }
}
