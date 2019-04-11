import React from 'react';
import {Link} from 'react-router-dom';
import './logo.scss';

const classes = new Bem('logo');
const Logo = () => (
    <Link to='/' {...classes()}>
        <img {...classes('img', '', ['d-none', 'd-sm-block'])} src={require('./img/logo.jpg')} alt='ExLibris'/>
        <span {...classes('divider', '', ['d-none', 'd-sm-block'])}/>
        <h3 {...classes('title')}>Meccano</h3>
    </Link>
);

export default Logo;
