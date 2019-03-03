import React, {Component} from 'react';
import './style.scss';

export default class HomePage extends Component {
    render() {
        const classes = new Bem('home-page');

        return (
            <div {...classes('', '', ['container', 'page'])}>
                <h1>Home Page</h1>
            </div>
        );
    }
}
