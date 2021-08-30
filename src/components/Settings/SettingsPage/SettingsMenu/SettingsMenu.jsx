import React, { useState } from 'react';
// import './settings-menu.scss';
// import VerticalMenu from '../../../Shared/VerticalMenu/VerticalMenu';
// import ImportExportIcon from '../../../Shared/SvgIcons/ImportExportIcon';
// import EarthIcon from '../../../Shared/SvgIcons/EarthIcon';
// import LoudSpeaker from '../../../Shared/SvgIcons/LoudSpeaker';
// import AuthorIcon from '../../../Shared/SvgIcons/AuthorsIcon';
// import SettingsIcon from '../../../Shared/SvgIcons/SettingsIcon';
import { Collapse, List, ListItem, ListItemIcon, ListItemText, makeStyles } from '@material-ui/core';
import Access from '../../../Shared/Access/Access';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import ImportContacts from '@material-ui/icons/ImportContacts';
import LocationOn from '@material-ui/icons/LocationOn';
import AccountTreeIcon from '@material-ui/icons/AccountTree';
import RecordVoiceOverIcon from '@material-ui/icons/RecordVoiceOver';
import GroupIcon from '@material-ui/icons/Group';
import SettingsIcon from '@material-ui/icons/Settings';
import { useHistory } from 'react-router-dom';


// const cls = new Bem('settings-menu');
const menu = [
    {
        id: 'io',
        icon: <ImportContacts />, // <ImportExportIcon />,
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
    },
    {
        id: 'location',
        icon: <LocationOn />, // <EarthIcon />,
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
    },
    {
        id: 'source',
        icon: <AccountTreeIcon/>, // <LoudSpeaker />,
        name: 'Источники',
        children: [{
            id: 'type',
            name: 'Тип источников',
            link: '/settings/source/type'
        }, {
            id: 'category',
            name: 'Вид источников',
            link: '/settings/source/category'
        }, {
            id: 'list',
            name: 'Список',
            link: '/settings/source/list'
        }]
    },
    {
        id: 'authors',
        icon: <RecordVoiceOverIcon />, // <AuthorIcon />,
        name: 'Авторы',
        link: '/settings/authors'
    },
    {
        id: 'users',
        icon: <GroupIcon />, // <AuthorIcon />,
        name: 'Пользователи',
        link: '/settings/users'
    },
    {
        id: 'sys',
        icon: <SettingsIcon />,
        name: 'Система',
        children: [{
            id: 'system',
            name: 'Общие',
            link: '/settings/system'
        }, {
            id: 'logs',
            name: 'Логирование',
            link: '/settings/system/logs'
        }]
    }
];

export const getActive = () => {
    const href = location.href;

    return href.substring(href.lastIndexOf('/') + 1);
};

// const SettingsMenuOld = ({onClick}) => {
//     return (
//         <VerticalMenu
//             {...cls()}
//             activeId={getActive()}
//             list={menu}
//             onClick={() => onClick(getActive())}
//             replaceHistory
//         />
//     );
// };

const settingsMenuStyles = makeStyles(({ spacing }) => ({
    nested: {
        paddingLeft: spacing(4)
    }
}));

const SettingsMenu = () => {
    const [, setUpdater] = useState(false);
    const history = useHistory();
    const classes = settingsMenuStyles();

    return (
        <List
            component='nav'
        >
            {menu.map(item => (
                <Access
                    permissions={item.permissions}
                    key={item.id}
                >
                    <ListItem
                        button
                        key={item.id}
                        onClick={() => {
                            if (item.link) {
                                return history.push(item.link);
                            }

                            item.open = !item.open;
                            setUpdater(s => !s);
                        }}
                    >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.name} />
                        {!!item.children?.length && (
                            <>
                                {item.open ? <ExpandLess /> : <ExpandMore />}
                            </>
                        )}
                    </ListItem>
                    {!!item.children?.length && (
                        <Collapse
                            in={item.open}
                            timeout='auto'
                            unmountOnExit
                        >
                            <List
                                component='div'

                            >
                                {item.children.map(child => (
                                    <ListItem
                                        key={child.id}
                                        className={classes.nested}
                                        button
                                        onClick={() => {
                                            history.push(child.link);
                                        }}
                                    >
                                        <ListItemText primary={child.name} />
                                    </ListItem>
                                ))}
                            </List>
                        </Collapse>
                    )}
                </Access>
            ))}
        </List>
    );
};

export default SettingsMenu;
