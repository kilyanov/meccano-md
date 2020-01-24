import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ConfirmModal from "../../../../Shared/ConfirmModal/ConfirmModal";
import {UserService} from "../../../../../services";
import Select from 'react-select';
import {PERMISSION, PERMISSION_NAMES} from "../../../../../constants/Permissions";
import './project-user-modal.scss';
import Loader from "../../../../Shared/Loader/Loader";

const cls = new Bem('project-user-modal');

export default class ProjectUserModal extends Component {
    static propTypes = {
        onClose: PropTypes.func.isRequired,
        projectId: PropTypes.string.isRequired
    };

    state = {
        user: this.props.user || null,
        users: [],
        permissions: [],
        inProgress: true
    };

    componentDidMount() {
        this.getUsers();
    }

    handleChangeUser = (user) => {
        this.setState({user});
    };

    handleChangePermissions = (permissions) => {
        this.setState({permissions});
    };

    handleSubmit = () => {
        const {projectId} = this.props;
        const {user, permissions} = this.state;

        this.setState({inProgress: true}, () => {
            const data = permissions.map(permission => {
                return {
                    user_id: user.value,
                    project_id: projectId,
                    item_name: permission.value
                };
            });

            UserService.project.create(data, projectId).then(response => {
                console.log(response);
                this.setState({inProgress: false});
            }).catch(() => this.setState({inProgress: false}));
        });
    };

    getUsers = () => {
        UserService.get().then(response => {
            this.setState({
                users: response.data.map(({username, id}) => ({label: username, value: id})),
                inProgress: false
            });
        });
    };

    isEdit = this.props.user && !_.isEmpty(this.props.user);

    permissionsOptions = Object.keys(PERMISSION).map(key => ({label: PERMISSION_NAMES[key], value: key}));

    render() {
        const {onClose} = this.props;
        const {users, user, permissions, inProgress} = this.state;

        console.log(user, permissions);

        return (
            <ConfirmModal
                {...cls()}
                title={`${this.isEdit ? 'Изменение' : 'Добавление'} пользователя`}
                onSubmit={this.handleSubmit}
                onClose={onClose}
            >
                <Select
                    {...cls('field')}
                    value={user}
                    placeholder='Выберите пользователя'
                    options={users}
                    onChange={this.handleChangeUser}
                    isSearchable
                    isClearable
                    isDisabled={this.isEdit || inProgress}
                    menuPosition='fixed'
                />

                <Select
                    {...cls('field')}
                    isMulti
                    placeholder='Выберите разрешения'
                    options={this.permissionsOptions}
                    onChange={this.handleChangePermissions}
                    isDisabled={inProgress}
                    value={permissions}
                    menuPosition='fixed'
                />

                {inProgress && <Loader />}
            </ConfirmModal>
        );
    }
}
