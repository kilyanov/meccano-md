import React, { useCallback, useEffect, useRef, useState } from 'react';
import User from "./User/User";
import UserModal from "./UserModal/UserModal";
import {UserService} from "../../../services";
import Loader from "../../Shared/Loader/Loader";
import Access from "../../Shared/Access/Access";
import {PERMISSION} from "../../../constants";
import PromiseDialogModal from "../../Shared/PromiseDialogModal/PromiseDialogModal";
import SettingsPage from '../SettingsPage/SettingsPage';
import { Box, Fab, List } from '@material-ui/core';
import Pagination from '@material-ui/lab/Pagination';
import AddIcon from '@material-ui/icons/Add';
import { usersStyles } from './styles';

const SettingsUsers = () => {
    const [users, setUsers] = useState([]);
    const [openUserModal, setOpenUserModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(false);
    const [inProgress, setInProgress] = useState(true);
    const [page, setPage] = useState(1);
    const [pageCount, setPageCount] = useState(1);

    const promiseModal = useRef(null);

    const classes = usersStyles();

    useEffect(() => getUsers({ page }), [page]);

    const getUsers = useCallback((options) => {
        UserService
            .get(options)
            .then(response => {
                setUsers(response.data);
                setPageCount(+response.headers['x-pagination-page-count'] || 1);
            })
            .finally(() => setInProgress(false));
    }, []);

    const handleCloseUserModal = useCallback(() => {
        setOpenUserModal(false);
        setSelectedUser(null);
    }, []);

    const handleAddUser = useCallback(() => {
        setOpenUserModal(true);
    }, []);

    const handleChangeUser = useCallback((user) => {
        setSelectedUser(user);
        setOpenUserModal(true);
    }, []);

    const handleDeleteUser = useCallback((user) => {
        if (!promiseModal.current) return;

        promiseModal.current
            .open({
                title: 'Удаление пользователя',
                content: `Вы уверены, что хтите удалить пользователя "${user.username}"?`,
                danger: true,
                submitText: 'Удалить'
            })
            .then(() => {
                setInProgress(true);
                return UserService.delete(user.id);
            })
            .then(getUsers);
    }, []);

    const handlePageChange = useCallback((p) => {
        setPage(p);
    }, []);

    return (
        <Access
            permissions={[ PERMISSION.viewUsers, PERMISSION.editUsers ]}
            redirect='/'
        >
            <SettingsPage
                title='Пользователи'
                subtitle=''
            >
                <Access permissions={[PERMISSION.editUsers]}>
                    <Fab
                        className={classes.fab}
                        onClick={handleAddUser}
                        color='primary'
                    >
                        <AddIcon />
                    </Fab>
                </Access>

                <Box marginBottom={2}>
                    <List component='div'>
                        {users.map(user => (
                            <User
                                key={user.id}
                                user={user}
                                onChange={handleChangeUser}
                                onDelete={handleDeleteUser}
                            />
                        ))}
                    </List>
                </Box>

                {openUserModal && (
                    <UserModal
                        userId={selectedUser ? selectedUser.id : ''}
                        onClose={handleCloseUserModal}
                        onUpdateParent={() => getUsers()}
                        selectedUser={selectedUser}
                    />
                )}

                <Pagination
                    count={pageCount}
                    onChange={(e, p) => handlePageChange(p)}
                    color='primary'
                />

                <PromiseDialogModal ref={promiseModal}/>

                {inProgress && <Loader fixed/>}
            </SettingsPage>
        </Access>
    );
};

export default SettingsUsers;
