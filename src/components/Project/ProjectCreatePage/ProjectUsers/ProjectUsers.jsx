import React, {Component} from 'react';
import PropTypes from 'prop-types';
import User from "../../../Users/User/User";
import InlineButton from "../../../Shared/InlineButton/InlineButton";
import ProjectUserModal from "./ProjectUserModal/ProjectUserModal";
import './project-users.scss';
import {UserService} from "../../../../services";

const cls = new Bem('project-users');

export default class ProjectUsers extends Component {
    static propTypes = {
        projectId: PropTypes.string.isRequired
    };

    state = {
        users: [],
        showCreateModal: false,
        selectedUser: null
    };

    componentDidMount() {
        this.getUserList();
    }

    getUserList = () => {
        const {projectId} = this.props;

        UserService.project.getList(projectId).then(response => {
            console.log(response);
            this.setState({ users: response.data });
        });
    };

    render() {
        const {projectId} = this.props;
        const {users, showCreateModal, selectedUser} = this.state;

        return (
            <div {...cls('', '', 'container')}>
                <section {...cls('header')}>
                    <h3>Доступ пользователей</h3>
                    <InlineButton
                        {...cls('add-user')}
                        onClick={() => this.setState({showCreateModal: true})}
                    >+ Добавить пользователя</InlineButton>
                </section>

                <section {...cls('content')}>
                    {users.map((user, userIndex) => (
                        <User user={user} key={userIndex} />
                    ))}
                </section>

                {showCreateModal && (
                    <ProjectUserModal
                        user={selectedUser}
                        projectId={projectId}
                        onClose={() => this.setState({selectedUserId: null, showCreateModal: false})}
                    />
                )}
            </div>
        );
    }
}
