import React, { useCallback, useEffect, useState } from 'react';
import { STORAGE_KEY, THEME_TYPE } from '../../../../constants';
import { useDispatch, useSelector } from 'react-redux';
import { setUserType } from '../../../../redux/actions';
import { StorageService } from '../../../../services';
import { AccountCircle } from '@material-ui/icons';
import { Checkbox, IconButton, ListItem, ListItemSecondaryAction, ListItemText, Menu, Typography } from '@material-ui/core';
import { useHistory } from 'react-router-dom';

const Profile = () => {
    const [
        autoSaveArticles,
        setAutoSaveArticles
    ] = useState(!!localStorage.getItem(STORAGE_KEY.AUTO_SAVE_ARTICLES));
    const [anchorEl, setAnchorEl] = useState(null);
    const [userTypeMenu, setUserTypeMenu] = useState([]);

    const {
        theme,
        userTypes,
        userType,
        profile,
        currentProject
    } = useSelector((state) => ({
        theme: state.theme,
        userTypes: state.userTypes,
        userType: state.userType,
        profile: state.profile,
        currentProject: state.currentProject
    }));

    const dispatch = useDispatch();
    const history = useHistory();

    useEffect(() => {
        const menu = [];
        const projectUserTypes = _.get(currentProject, 'userProject.userProjectTypes', []);

        if (userTypes.length && projectUserTypes.length) {
            const availableUserTypes = projectUserTypes.map(ut => {
                return userTypes.find(({id}) => ut.user_type_id === id);
            });

            availableUserTypes.forEach(ut => {
                menu.unshift({
                    id: ut.id,
                    name: ut.name,
                    onClick: () => this.handleChangeUserType(ut)
                });
            });
        }

        if (menu !== userTypeMenu) {
            setUserTypeMenu(menu);
        }
    }, [userTypes, currentProject]);

    const handleChangeUserType = useCallback((userType) => {
        if (!userType) {
            return;
        }

        dispatch(setUserType(userType));
    }, []);

    const handleSwitchTheme = useCallback(() => {
        StorageService.set('theme', THEME_TYPE[theme.toUpperCase()] === 'light' ? THEME_TYPE.DARK : THEME_TYPE.LIGHT);
    }, []);

    const handleSwitchAutoSave = useCallback(() => {
        setAutoSaveArticles(s => {
            if (s) {
                StorageService.remove(STORAGE_KEY.AUTO_SAVE_ARTICLES);
            } else {
                StorageService.set(STORAGE_KEY.AUTO_SAVE_ARTICLES, 'true');
            }

            return !s;
        });
    }, []);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <div>
            <IconButton
                color='inherit'
                onClick={handleMenu}
            >
                <AccountCircle />
            </IconButton>
            <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right'
                }}
                keepMounted
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right'
                }}
                open={open}
                onClose={handleClose}
            >
                {userTypeMenu.map((item, itemIndex) => {
                    const isActive = item.id === (userType && userType.id);
                    return (
                        <ListItem key={itemIndex}>
                            <ListItemText>
                                <Typography variant='subtitle1'>{item.name}</Typography>
                            </ListItemText>
                            <ListItemSecondaryAction>
                                <Checkbox
                                    checked={isActive}
                                    onClick={() => item.onClick()}
                                />
                            </ListItemSecondaryAction>
                        </ListItem>
                    );
                })}
            </Menu>
        </div>
    );
};

export default Profile;
