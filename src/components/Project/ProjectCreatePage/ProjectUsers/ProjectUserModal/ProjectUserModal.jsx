import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ConfirmModal from "../../../../Shared/ConfirmModal/ConfirmModal";
import { UserService } from "../../../../../services";
import Select from 'react-select';
import './project-user-modal.scss';
import Loader from "../../../../Shared/Loader/Loader";
import { connect } from "react-redux";
import CheckBox from "../../../../Form/CheckBox/CheckBox";
import { PROJECT_USER_PERMISSIONS, PROJECT_USER_TRANSMIT } from "../consts";
import { ReactSelectStyles } from "../../../../../constants/ReactSelectStyles";
import { THEME_TYPE } from "../../../../../constants";
import AsyncCreateableSelect from '../../../../Form/AsyncCreatebleSelect/AsyncCreateableSelect';

const cls = new Bem('project-user-modal');
const defaulForm = {
    user_id: null,
    userProjectTypes: [],
    access_read: true,
    access_edit: false,
    access_full: false,
    access_project_manager: false,
    transmit_project_manager: false,
    transmit_analytic: false,
    transmit_client: false
};

class ProjectUserModal extends Component {
    static propTypes = {
        onClose: PropTypes.func.isRequired,
        projectId: PropTypes.string.isRequired
    };

    state = {
        form: { ...defaulForm },
        user: null,
        users: [],
        userTypes: [],
        inProgress: true
    };

    componentDidMount() {
        if (this.props.projectUser) {
            this.prepareProjectUser();
        } else {
            this.getUsers();
        }

        this.getUserTypes();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.userTypes.length !== this.props.userTypes.length) {
            this.getUserTypes();
        }
    }

    handleChangeForm = (prop, value) => {
        this.setState(({ form }) => {
            if (prop === 'userProjectTypes' && !value) {
                return { form };
            }

            form[prop] = value;

            return { form };
        }, () => {
            if (prop.includes('access')) {
                this.checkAccessRights(prop, value);
            }
        });
    };

    handleSubmit = () => {
        const { projectId } = this.props;
        const { form } = this.state;

        if (!form.user_id || !projectId || !form.userProjectTypes.length) return;

        this.setState({ inProgress: true }, () => {
            const requestForm = { ...form };

            requestForm.user_id = requestForm.user_id.value;
            requestForm.userProjectTypes = requestForm.userProjectTypes.map(({ id, value }) => ({ id, user_type_id: value }));
            requestForm.project_id = projectId;

            UserService.project.create(requestForm, projectId).then(response => {
                this.props.onChange(response.data);
                this.setState({ inProgress: false }, this.close);
            }).catch(() => this.setState({ inProgress: false }));
        });
    };

    getUsers = () => {
        UserService.get().then(response => {
            this.setState({
                users: response.data.map(({ username, id }) => ({ label: username, value: id })),
                inProgress: false
            });
        });
    };

    getUserTypes = () => {
        const userTypes = this.props.userTypes.map(({ id, name }) => ({ label: name, value: id }));

        this.setState(state => {
            state.userTypes = userTypes;

            if (!state.form.userProjectTypes || !state.form.userProjectTypes.length) {
                state.form.userProjectTypes = [ userTypes[0] ];
            }

            return state;
        });
    };

    prepareProjectUser = () => {
        const { projectUser } = this.props;
        const user = { label: projectUser.user.username, value: projectUser.user.id };

        this.setState({
            users: [ user ],
            form: {
                ...projectUser,
                user_id: user,
                userProjectTypes: projectUser.userProjectTypes.map(({ userType: { name, id } }) => (
                    { label: name, value: id }
                ))
            },
            inProgress: false
        });
    };

    checkAccessRights = (current, checked) => {
        let sets = true;

        this.setState(({ form }) => {
            PROJECT_USER_PERMISSIONS.forEach(({ id }) => {
                if (current === id) {
                    sets = false;
                }

                form[id] = sets;

                if (checked && current === id) {
                    form[id] = true;
                }
            });

            return { form };
        });
    };

    close = () => {
        this.setState(state => {
            state.form = { ...defaulForm };
            return state;
        }, this.props.onClose);
    };

    isEdit = this.props.projectUser && !_.isEmpty(this.props.projectUser);

    mapUserService = (req) => {
        let query = {};
        if ('query[name]' in req) {
            query = {
                'query[username]': req['query[name]']
            };
        }
        return new Promise((resolve, reject) => {
            UserService.get(query)
                .then((res) => {
                    const mapUserData = res?.data?.map((user) => {
                        return {
                            id: user.id,
                            name: user.username
                        };
                    });
                    resolve({ data: mapUserData });
                })
                .catch(reject);
        });
    }

    render() {
        const { theme } = this.props;
        const { users, userTypes, form, inProgress } = this.state;
        const isDarkTheme = theme === THEME_TYPE.DARK;

        return (
            <ConfirmModal
                {...cls()}
                title={`${this.isEdit ? 'Изменение' : 'Добавление'} пользователя`}
                onSubmit={this.handleSubmit}
                onClose={() => this.close()}
            >
                <section {...cls('field')}>
                    <span {...cls('label')}>Пользователь:</span>
                    <AsyncCreateableSelect
                        selected={form.user_id?.value || null}
                        canCreate={false}
                        placeholder='Выберите пользователя'
                        classNamePrefix='select'
                        options={users}
                        onChange={select => this.handleChangeForm('user_id', select || null)}
                        isSearchable
                        isClearable
                        isDisabled={this.isEdit || inProgress}
                        menuPosition='fixed'
                        requestService={this.mapUserService}
                        styles={ReactSelectStyles(isDarkTheme)}
                    />
                </section>

                <section {...cls('field')}>
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
                        styles={ReactSelectStyles(isDarkTheme)}
                    />
                </section>

                <section {...cls('field')}>
                    <span {...cls('label')}>Разрешения:</span>

                    <ul {...cls('list')}>
                        {PROJECT_USER_PERMISSIONS.map((item) => (
                            <li
                                key={item.id}
                                {...cls('list-item')}
                            >
                                <CheckBox
                                    {...cls('list-item-field')}
                                    disabled={item.id === 'access_read'}
                                    checked={form[item.id]}
                                    onChange={value => this.handleChangeForm(item.id, value)}
                                >
                                    {item.name}
                                </CheckBox>
                            </li>
                        ))}
                    </ul>
                </section>

                <section {...cls('field')}>
                    <span {...cls('label')}>Возможность передачи статей:</span>

                    <ul {...cls('list')}>
                        {PROJECT_USER_TRANSMIT.map((item) => (
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

                {inProgress && <Loader/>}
            </ConfirmModal>
        );
    }
}

export default connect(({ userTypes, theme }) => ({ userTypes, theme }))(ProjectUserModal);
