import React from 'react';
import { connect } from 'react-redux';
import {switchTheme} from '../../../../redux/actions/theme';
import store from '../../../../redux/store';
import HalfMoonIcon from '../../SvgIcons/HalfMoonIcon';
import './theme-button.scss';

const classes = new Bem('theme-button');

const ThemeButton = ({ className, theme }) => (
    <div
        {...classes('', '', className)}
        onClick={() => store.dispatch(switchTheme())}
    >
        <HalfMoonIcon {...classes('icon', { [theme]: true})} />
    </div>
);

export default connect(({ theme }) => ({ theme }))(ThemeButton);
