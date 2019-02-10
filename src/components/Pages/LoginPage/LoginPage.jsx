import React, {Component} from 'react';
import {connect} from 'react-redux';
import './login-page.scss';
import {getCountries} from "../../../redux/actions/country";
import store from '../../../redux/store';

class LoginPage extends Component {
    componentDidMount() {
        store.dispatch(getCountries());
    }

    render() {
        const classes = new Bem('login-page');

        return (
            <div {...classes('', '', 'page')}>
                <h1>Login</h1>

                <form {...classes('form')}>
                    <select {...classes('country-list')} placeholder='select a country'>
                        {this.props.countries.map(country =>
                            <option {...classes('country-item')} key={country.code}>{country.country}</option>
                        )}
                    </select>

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

export default connect(({countries}) => ({countries}))(LoginPage);
