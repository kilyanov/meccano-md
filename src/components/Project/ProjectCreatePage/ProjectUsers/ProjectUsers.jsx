import React, {Component} from 'react';
import PropTypes from 'prop-types';
import InlineButton from "../../../Shared/InlineButton/InlineButton";
import ProjectUserModal from "./ProjectUserModal/ProjectUserModal";
import './project-users.scss';
import {UserService} from "../../../../services";
import Loader from "../../../Shared/Loader/Loader";
import ProjectUser from "./ProjectUser/ProjectUser";
import PromiseDialogModal from "../../../Shared/PromiseDialogModal/PromiseDialogModal";

const cls = new Bem('project-users');

export default class ProjectUsers extends Component {
    static propTypes = {
        projectId: PropTypes.string.isRequired
    };

    state = {
        users: [],
        showCreateModal: false,
        selectedUser: null,
        inProgress: true
    };

    componentDidMount() {
        this.getUserList();
    }

    handleChangeUsers = (users) => {
        this.setState({users});
    };

    handleDelete = (user) => {
        const {projectId} = this.props;

        this.promiseModal.open({
            title: 'Удаление документа',
            content: `Вы уверены, что хотите удалить пользователя "${user.username}"?`,
            danger: true
        }).then(() => {
            UserService.project.delete(projectId, user.id).then(this.getUserList);
        });
    };

    getUserList = () => {
        const {projectId} = this.props;

        UserService.project.getList(projectId).then(response => {
            this.setState({
                users: response.data,
                inProgress: false
            });
        });
    };

    render() {
        const {projectId} = this.props;
        const {users, showCreateModal, selectedUser, inProgress} = this.state;

        return (
            <div {...cls('', '', 'container')}>
                <section {...cls('header')}>
                    <h3>Доступ пользователей</h3>
                    <InlineButton
                        {...cls('add-user')}
                        onClick={() => this.setState({showCreateModal: true})}
                    >+ Добавить пользователя</InlineButton>
                </section>

                <section {...cls('user-list')}>
                    {users.map((user, userIndex) => (
                        <ProjectUser
                            key={userIndex}
                            projectUser={user}
                            onChange={() => this.setState({showCreateModal: true, selectedUser: user})}
                            onDelete={this.handleDelete}
                        />
                    ))}
                </section>

                {showCreateModal && (
                    <ProjectUserModal
                        projectUser={selectedUser}
                        projectId={projectId}
                        onChange={this.handleChangeUsers}
                        onClose={() => this.setState({selectedUser: null, showCreateModal: false})}
                    />
                )}

                <PromiseDialogModal ref={ref => this.promiseModal = ref} />

                {inProgress && <Loader/>}
            </div>
        );
    }
}
