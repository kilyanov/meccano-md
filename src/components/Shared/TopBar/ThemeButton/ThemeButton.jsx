import React from 'react';
import { connect } from 'react-redux';
import {switchTheme} from '../../../../redux/actions/theme';
import store from '../../../../redux/store';
import HalfMoonIcon from '../../SvgIcons/HalfMoonIcon';
import './theme-button.scss';
import {StorageService} from '../../../../services';
import {THEME_TYPE} from '../../../../constants/ThemeType';

const cls = new Bem('theme-button');

const ThemeButton = ({ className, theme }) => {
    const handleClick = () => {
        StorageService.set('theme', THEME_TYPE[theme.toUpperCase()] === 'light' ? THEME_TYPE.DARK : THEME_TYPE.LIGHT);
        store.dispatch(switchTheme());
    };

    return (
        <div
            {...cls('', '', className)}
            onClick={handleClick}
        >
            <HalfMoonIcon {...cls('icon', { [theme]: true})} />
        </div>
    );
};

export default connect(({ theme }) => ({ theme }))(ThemeButton);
