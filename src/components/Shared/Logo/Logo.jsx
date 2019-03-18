import React from 'react';
import {Link} from 'react-router-dom';
import './logo.scss';

const classes = new Bem('logo');
const Logo = () => (
    <Link to='/' {...classes()}>
        <img {...classes('img')} src={require('./img/logo-export_original.png')} alt='ExLibris'/>
        <span {...classes('divider')}/>
        <h3 {...classes('title')}>Meccano</h3>
    </Link>
);

export default Logo;
