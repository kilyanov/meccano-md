import React from 'react';
import {Link} from 'react-router-dom';
import './logo.scss';
import LogoIcon from '../SvgIcons/LogoIcon';

const cls = new Bem('logo');

const Logo = ({ className, onClick }) => (
    <Link to='/' {...cls('', '', className)} onClick={onClick}>
        <LogoIcon {...cls('img', '', ['d-none', 'd-sm-block'])}/>
        {/* <img {...cls('img', '', ['d-none', 'd-sm-block'])} src={require('./img/logo.jpg')} alt='ExLibris'/> */}
        <span {...cls('divider', '', ['d-none', 'd-sm-block'])}/>
        <h3 {...cls('title')}>Meccano</h3>
    </Link>
);

export default Logo;
