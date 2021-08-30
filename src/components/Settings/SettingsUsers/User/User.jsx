import React, { Fragment, useCallback } from 'react';
import {useSelector} from 'react-redux';
import Access from '../../../Shared/Access/Access';
import {PERMISSION} from '../../../../constants';
import {
    Divider,
    ListItem,
    ListItemAvatar,
    ListItemSecondaryAction,
    ListItemText,
    Menu,
    MenuItem,
    Typography,
    IconButton
} from '@material-ui/core';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import MoreVertIcon from '@material-ui/icons/MoreVert';

const User = ({user, onChange, onDelete}) => {
    const [anchorEl, setAnchorEl] = React.useState(null);

    const userTypes = useSelector(state => state.userTypes);
    let userTypesString = '';

    if (user.types && user.types.length) {
        userTypesString = userTypes.filter(({id}) => user.types.find(t => t.id === id)).map(({name}) => name).join(', ');
    }

    const handleClickMenu = useCallback((event) => {
        setAnchorEl(event.currentTarget);
    }, []);

    const handleCloseMenu = useCallback(() => {
        setAnchorEl(null);
    }, []);

    return (
        <Fragment key={user.id}>
            <ListItem alignItems='flex-start'>
                <ListItemAvatar>
                    <AccountCircleIcon fontSize='large' />
                </ListItemAvatar>
                <ListItemText
                    primary={
                        <Typography
                            variant='h4'
                        >
                            {user.username}
                        </Typography>
                    }
                    secondary={
                        <Fragment>
                            <Typography
                                component='span'
                                variant='caption'
                                // className={classes.inline}
                                color='textPrimary'
                            >
                                {userTypesString}
                            </Typography>
                            <br />
                            {user.email}
                        </Fragment>
                    }
                />
                <Access permissions={[PERMISSION.editUsers]}>
                    <ListItemSecondaryAction>
                        <IconButton
                            edge="end"
                            aria-label="comments"
                            onClick={handleClickMenu}
                        >
                            <MoreVertIcon />
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            keepMounted
                            open={Boolean(anchorEl)}
                            onClose={handleCloseMenu}
                        >
                            <MenuItem
                                onClick={() => {
                                    onChange(user);
                                    handleCloseMenu();
                                }}
                            >
                                Изменить
                            </MenuItem>
                            <MenuItem
                                onClick={() => {
                                    onDelete(user);
                                    handleCloseMenu();
                                }}
                            >
                                <Typography
                                    variant="inherit"
                                    noWrap
                                    color='secondary'
                                >
                                    Удалить
                                </Typography>
                            </MenuItem>
                        </Menu>
                    </ListItemSecondaryAction>
                </Access>
            </ListItem>
            <Divider variant='inset' component='div' />
        </Fragment>
    );

    // return (
    //     <div {...cls()}>
    //         <section {...cls('image')}>
    //             <ProfileIcon {...cls('icon')}/>
    //         </section>
    //         <section {...cls('data')}>
    //             <div {...cls('data-item')}>
    //                 <h3 {...cls('title')}>{user.username}</h3>
    //                 <span {...cls('subtitle')}>{userTypesString}</span>
    //             </div>
    //             <div {...cls('data-item')}>
    //                 <a {...cls('data-item-link')} href={`mailto:${user.email}`}>{user.email}</a>
    //             </div>
    //             <div {...cls('data-item', 'small')}>
    //                 {/* {user.permissions.map(({description}) => description).join(', ')} */}
    //             </div>
    //         </section>
    //         <section {...cls('buttons')}>
    //             <Access permissions={[PERMISSION.editUsers]}>
    //                 <InlineButton
    //                     {...cls('button')}
    //                     onClick={() => onChange(user)}
    //                     small
    //                 >Изменить</InlineButton>
    //
    //                 <InlineButton
    //                     {...cls('button')}
    //                     onClick={() => onDelete(user)}
    //                     danger
    //                     small
    //                 >Удалить</InlineButton>
    //             </Access>
    //         </section>
    //     </div>
    // );
};

export default User;
