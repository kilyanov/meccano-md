import React, { useCallback } from 'react';
import {useSelector, useDispatch} from 'react-redux';
import SettingsPage from "../SettingsPage/SettingsPage";
import {THEME_TYPE} from "../../../constants";
import { setAppProgress, switchTheme } from "../../../redux/actions";
import Switcher from "../../Form/Switcher/Switcher";
import {StorageService} from "../../../services";
import './settings-system.scss';
import Button from '../../Shared/Button/Button';
import { SystemService } from '../../../services/SystemService';

const cls = new Bem('settings-system');

const SettingsSystem = () => {
    const theme = useSelector(state => state.theme);
    const dispatch = useDispatch();


    const handleClick = useCallback(() => {
        StorageService.set('theme', THEME_TYPE[theme.toUpperCase()] === 'light'
            ? THEME_TYPE.DARK
            : THEME_TYPE.LIGHT
        );
        dispatch(switchTheme());
    }, []);

    const handleResetCache = useCallback(() => {
        dispatch(setAppProgress({ inProgress: true }));
        SystemService
            .clearCache()
            .finally(() => dispatch(setAppProgress({ inProgress: false })));
    }, []);


    return (
        <SettingsPage
            {...cls()}
            title='Общие'
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

            <div {...cls('item')}>
                <span {...cls('item-label')}>Сброс кэша</span>
                <Button
                    {...cls('item-button')}
                    style='error'
                    onClick={handleResetCache}
                >
                    Сбросить кэш
                </Button>
            </div>
        </SettingsPage>
    );
};

export default SettingsSystem;
