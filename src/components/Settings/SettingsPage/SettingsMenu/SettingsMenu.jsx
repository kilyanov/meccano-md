import React from 'react';
import './settings-menu.scss';
import VerticalMenu from '../../../Shared/VerticalMenu/VerticalMenu';
import ImportExportIcon from '../../../Shared/SvgIcons/ImportExportIcon';
import EarthIcon from '../../../Shared/SvgIcons/EarthIcon';
import LoudSpeaker from '../../../Shared/SvgIcons/LoudSpeaker';

const classes = new Bem('settings-menu');
const menu = [{
    id: 'io',
    icon: <ImportExportIcon/>,
    name: 'Шаблоны',
    children: [{
        id: 'import',
        name: 'Импорт',
        link: '/settings/templates/import'
    }, {
        id: 'export',
        name: 'Экспорт',
        link: '/settings/templates/export'
    }]
}, {
    id: 'location',
    icon: <EarthIcon/>,
    name: 'Местоположение',
    children: [{
        id: 'country',
        name: 'Страна',
        link: '/settings/location/country'
    }, {
        id: 'federal',
        name: 'Федеральный округ',
        link: '/settings/location/federal'
    }, {
        id: 'region',
        name: 'Регион',
        link: '/settings/location/region'
    }, {
        id: 'city',
        name: 'Город',
        link: '/settings/location/city'
    }]
}, {
    id: 'source',
    icon: <LoudSpeaker/>,
    name: 'Источники',
    children: [{
        id: 'type',
        name: 'Тип источников',
        link: '/settings/source/type'
    }, {
        id: 'list',
        name: 'Список',
        link: '/settings/source/list'
    }]
}];

const SettingsMenu = () => {
    const href = location.href;
    const activeId =  href.substring(href.lastIndexOf('/') + 1);

    return (
        <VerticalMenu
            {...classes()}
            activeId={activeId}
            list={menu}
            autoOpen
            replaceHistory
        />
    );
};

export default SettingsMenu;
