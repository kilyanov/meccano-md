import React, {Component} from 'react';
import Page from "../Shared/Page/Page";
import User from "./User/User";
import InlineButton from "../Shared/InlineButton/InlineButton";
import UserModal from "./UserModal/UserModal";
import UserService from "../../services/UserService";
import Loader from "../Shared/Loader/Loader";

const classes = new Bem('users-page');

export default class UsersPage extends Component {
    state = {
        users: [],
        openUserModal: false,
        selectedUser: null,
        inProgress: true
    };

    componentDidMount() {
        this.getUsers();
    }

    handleCloseUserModal = () => {
        this.setState({openUserModal: false, selectedUser: null});
    };

    handleAddUser = () => {
        this.setState({openUserModal: true});
    };

    handleChangeUser = (user) => {
        this.setState({openUserModal: true, selectedUser: user});
    };

    handleDeleteUser = (userId) => {
        console.log('Delete user', userId);
    };

    getUsers = () => {
        UserService.get().then(response => {
            this.setState({
                users: response.data,
                inProgress: false
            });
        })
    };

    render() {
        const {users, openUserModal, selectedUser, inProgress} = this.state;

        return (
            <Page {...classes()} withBar>
                <section {...classes('filter-panel')}>
                    <InlineButton
                        onClick={this.handleAddUser}
                    >+ Добавить</InlineButton>
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
                        onClose={this.handleCloseUserModal}
                        selectedUser={selectedUser}
                    />
                )}

                {inProgress && <Loader fixed/>}
            </Page>
        );
    }
}
