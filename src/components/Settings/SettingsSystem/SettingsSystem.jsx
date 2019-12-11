import React from 'react';
import {useSelector, useDispatch} from 'react-redux';
import SettingsPage from "../SettingsPage/SettingsPage";
import {THEME_TYPE} from "../../../constants/ThemeType";
import {switchTheme} from "../../../redux/actions/theme";
import Switcher from "../../Form/Switcher/Switcher";
import {StorageService} from "../../../services";
import './settings-system.scss';

const cls = new Bem('settings-system');

const SettingsSystem = () => {
    const theme = useSelector(state => state.theme);
    const dispatch = useDispatch();
    const handleClick = () => {
        StorageService.set('theme', THEME_TYPE[theme.toUpperCase()] === 'light' ? THEME_TYPE.DARK : THEME_TYPE.LIGHT);
        dispatch(switchTheme());
    };

    return (
        <SettingsPage
            {...cls()}
            title='Система'
            subtitle=''
        >
            <div {...cls('item')}>
                <span {...cls('item-label')}>Темная тема</span>
                <Switcher
                    {...cls('item-button')}
                    checked={theme === THEME_TYPE.DARK}
                    onChange={handleClick}
                />
            </div>
        </SettingsPage>
    );
};

export default SettingsSystem;
