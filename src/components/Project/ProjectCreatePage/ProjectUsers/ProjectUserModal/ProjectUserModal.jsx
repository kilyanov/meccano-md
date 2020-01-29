import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ConfirmModal from "../../../../Shared/ConfirmModal/ConfirmModal";
import {UserService} from "../../../../../services";
import Select from 'react-select';
import './project-user-modal.scss';
import Loader from "../../../../Shared/Loader/Loader";
import {connect} from "react-redux";
import CheckBox from "../../../../Form/CheckBox/CheckBox";

const cls = new Bem('project-user-modal');

class ProjectUserModal extends Component {
    static propTypes = {
        onClose: PropTypes.func.isRequired,
        projectId: PropTypes.string.isRequired
    };

    state = {
        form: {
            user_id: this.props.user || null,
            userProjectTypes: [],
            access_read: false,
            access_edit: false,
            access_full: false,
            transmit_project_manager: false,
            transmit_analytic: false,
            transmit_client: false
        },
        user: this.props.user || null,
        users: [],
        userTypes: [],
        permissions: [],
        inProgress: true
    };

    componentDidMount() {
        this.getUsers();
        this.getUserTypes();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.userTypes.length !== this.props.userTypes.length) {
            this.getUserTypes();
        }
    }

    handleChangeForm = (prop, value) => {
        this.setState(({form}) => {
            form[prop] = value;
            return {form};
        });
    };

    handleSubmit = () => {
        const {projectId} = this.props;
        const {form} = this.state;

        this.setState({inProgress: true}, () => {
            const requestForm = {...form};

            requestForm.user_id = requestForm.user_id.value;
            requestForm.userProjectTypes = requestForm.userProjectTypes.map(({id, value}) => ({id, user_type_id: value}));
            requestForm.project_id = projectId;

            UserService.project.create(requestForm, projectId).then(response => {
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

    getUserTypes = () => {
        const userTypes = this.props.userTypes.map(({id, name}) => ({label: name, value: id}));

        this.setState(state => {
            state.userTypes = userTypes;
            state.form.userProjectTypes = [userTypes[0]];

            return state;
        });
    };

    isEdit = this.props.user && !_.isEmpty(this.props.user);

    permissions = [
        {
            id: 'access_read',
            name: 'Только чтение'
        },
        {
            id: 'access_edit',
            name: 'Редактирование своих'
        },
        {
            id: 'access_full',
            name: 'Полный доступ'
        },
        {
            id: 'access_project_manager',
            name: 'Проект-менеджер'
        }
    ];

    transmit = [
        {
            id: 'transmit_project_manager',
            name: 'проект-менеджеру'
        },
        {
            id: 'transmit_analytic',
            name: 'аналитикам'
        },
        {
            id: 'transmit_client',
            name: 'клиенту'
        }
    ];

    render() {
        const {onClose} = this.props;
        const {users, userTypes, form, inProgress} = this.state;

        return (
            <ConfirmModal
                {...cls()}
                title={`${this.isEdit ? 'Изменение' : 'Добавление'} пользователя`}
                onSubmit={this.handleSubmit}
                onClose={onClose}
            >
                <span {...cls('label')}>Пользователь:</span>
                <Select
                    {...cls('field')}
                    value={form.user_id}
                    placeholder='Выберите пользователя'
                    classNamePrefix='select'
                    options={users}
                    onChange={value => this.handleChangeForm('user_id', value)}
                    isSearchable
                    isClearable
                    isDisabled={this.isEdit || inProgress}
                    menuPosition='fixed'
                />

                <span {...cls('label')}>Тип пользователя:</span>
                <Select
                    {...cls('field')}
                    isMulti
                    placeholder='Тип пользователя'
                    classNamePrefix='select'
                    options={userTypes}
                    onChange={value => this.handleChangeForm('userProjectTypes', value)}
                    isDisabled={inProgress}
                    value={form.userProjectTypes}
                    menuPosition='fixed'
                />

                <section {...cls('section')}>
                    <span {...cls('label')}>Разрешения:</span>

                    <ul {...cls('list')}>
                        {this.permissions.map((item) => (
                            <li
                                key={item.id}
                                {...cls('list-item')}
                            >
                                <CheckBox
                                    {...cls('list-item-field')}
                                    checked={form[item.id]}
                                    onChange={value => this.handleChangeForm(item.id, value)}
                                >
                                    {item.name}
                                </CheckBox>
                            </li>
                        ))}
                    </ul>
                </section>

                <section {...cls('section')}>
                    <span {...cls('subtitle')}>Возможность передачи статей:</span>

                    <ul {...cls('list')}>
                        {this.transmit.map((item) => (
                            <li
                                key={item.id}
                                {...cls('list-item')}
                            >
                                <CheckBox
                                    {...cls('list-item-field')}
                                    checked={form[item.id]}
                                    onChange={value => this.handleChangeForm(item.id, value)}
                                >
                                    {item.name}
                                </CheckBox>
                            </li>
                        ))}
                    </ul>
                </section>

                {inProgress && <Loader />}
            </ConfirmModal>
        );
    }
}

export default connect(({userTypes}) => ({userTypes}))(ProjectUserModal);
