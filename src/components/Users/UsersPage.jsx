import React, {Component} from 'react';
import Page from "../Shared/Page/Page";
import User from "./User/User";
import InlineButton from "../Shared/InlineButton/InlineButton";
import UserModal from "./UserModal/UserModal";
import {UserService} from "../../services";
import Loader from "../Shared/Loader/Loader";
import Access from "../Shared/Access/Access";
import {PERMISSION} from "../../constants";
import PromiseDialogModal from "../Shared/PromiseDialogModal/PromiseDialogModal";
import Pagination from '../Shared/Pagination';
import './users-page.scss';

const classes = new Bem('users-page');

export default class UsersPage extends Component {
    state = {
        users: [],
        openUserModal: false,
        selectedUser: null,
        inProgress: true,
        paginationPage: 1,
        paginationPageCount: 1
    };

    componentDidMount() {
        this.getUsers();
    }

    handleCloseUserModal = () => {
        this.setState({
            openUserModal: false,
            selectedUser: null
        });
    };

    handleAddUser = () => {
        this.setState({openUserModal: true});
    };

    handleChangeUser = (user) => {
        this.setState({
            openUserModal: true,
            selectedUser: user
        });
    };

    handleDeleteUser = (user) => {
        if (!this.promiseModal) return;

        this.promiseModal
            .open({
                title: 'Удаление пользователя',
                content: `Вы уверены, что хтите удалить пользователя "${user.username}"?`,
                danger: true,
                submitText: 'Удалить'
            })
            .then(() => UserService.delete(user.id))
            .then(this.getUsers);
    };

    handlePageChange = (currentPage) => {
        this.getUsers({
            page: currentPage
        });
    }

    getUsers = (options) => {
        UserService.get(options).then(response => {
            this.setState({
                users: response.data,
                inProgress: false,
                paginationPageCount: response.headers['x-pagination-page-count'] || 1
            });
        });
    };

    render() {
        const {users, openUserModal, selectedUser, inProgress, paginationPage, paginationPageCount} = this.state;

        return (
            <Access
                permissions={[ PERMISSION.viewUsers, PERMISSION.editUsers ]}
                redirect='/'
            >
                <Page title='Пользователи' {...classes()} withBar>
                    <section {...classes('filter-panel')}>
                        <Access permissions={[PERMISSION.editUsers]}>
                            <InlineButton
                                onClick={this.handleAddUser}
                            >+ Добавить</InlineButton>
                        </Access>
                    </section>

                    <section {...classes('list')}>
                        {users.map(user => (
                            <User
                                key={user.id}
                                user={user}
                                onChange={this.handleChangeUser}
                                onDelete={this.handleDeleteUser}
                            />
                        ))}
                    </section>

                    {openUserModal && (
                        <UserModal
                            userId={selectedUser ? selectedUser.id : ''}
                            onClose={this.handleCloseUserModal}
                            onUpdateParent={() => this.getUsers()}
                            selectedUser={selectedUser}
                        />
                    )}

                    <div {...classes('pagination')}>
                        <Pagination
                            page={paginationPage}
                            pageCount={paginationPageCount}
                            onPageChange={this.handlePageChange}
                        />
                    </div>

                    <PromiseDialogModal ref={ref => this.promiseModal = ref}/>

                    {inProgress && <Loader fixed/>}
                </Page>
            </Access>
        );
    }
}
