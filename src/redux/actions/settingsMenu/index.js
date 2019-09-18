import {ACTION_TYPE} from "../../../constants/ActionTypes";

export const openSettingsMenu = () => ({type: ACTION_TYPE.SETTINGS_MENU.OPEN});

export const closeSettingsMenu = () => ({type: ACTION_TYPE.SETTINGS_MENU.CLOSE});

export const toggleSettingsMenu = () => ({type: ACTION_TYPE.SETTINGS_MENU.TOGGLE});
