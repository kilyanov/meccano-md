import React from 'react';
import {connect} from 'react-redux';
import store from '../../../redux/store';
import {toggleSettingsMenu} from '../../../redux/actions/settingsMenu';
import './menu-hamburger.scss';

const classes = new Bem('menu-hamburger');
const MenuHamburger = ({settingsMenu}) => {
    return (
        <button
            {...classes('', {open: settingsMenu.open})}
            onClick={() => store.dispatch(toggleSettingsMenu())}
        >
            <span />
            <span />
            <span />
        </button>
    );
};

const mapStateToProps = ({settingsMenu}) => ({settingsMenu});

export default connect(mapStateToProps)(MenuHamburger);
