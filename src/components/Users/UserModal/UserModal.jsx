import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {UserService} from "../../../services";
import ConfirmModal from "../../Shared/ConfirmModal/ConfirmModal";
import Form from "../../Form/Form/Form";
import InputText from "../../Form/InputText/InputText";
import Loader from "../../Shared/Loader/Loader";
import {connect} from 'react-redux';
import {NotificationManager} from "react-notifications";
import Select from "../../Form/Select/Select";
import {slugify} from 'transliteration';
import { isAccess } from "../../../helpers/Tools";
import { PERMISSION } from "../../../constants";

const classes = new Bem('user-modal');

class UserModal extends Component {
    static propTypes = {
        userId: PropTypes.string,
        onClose: PropTypes.func.isRequired,
        onUpdateParent: PropTypes.func.isRequired
    };

    state = {
        form: {
            username: '',
            name: '',
            surname: '',
            department: '',
            password: '',
            email: '',
            roles: [],
            types: [],
            permissions: []
        },
        inProgress: !!this.props.userId
    };

    componentDidMount() {
        const {userId} = this.props;

        if (userId) {
            UserService.getProfile(userId).then(response => {
                const form = response.data;

                form.roles = form.roles.map(({name, description}) => ({name, value: name, description}));
                form.types = form.types.map(({name, id}) => ({name, value: id}));

                this.setState({
                    form: response.data,
                    inProgress: false
                });
            });
        }
    }

    handleChangeForm = (value, prop) => {
        this.setState(({form}) => {
            form[prop] = value;

            // Транслит для Логина
            if (['name', 'surname'].includes(prop) && !form.username) {
                this.username = `${slugify(form.surname)}${form.name ? '_' : ''}${slugify(form.name ? form.name : '')}`;
            }

            if (prop === 'username') {
                this.username = value;
            }

            return {form};
        });
    };

    handleSubmit = () => {
        const {userId} = this.props;
        const isEdit  = !!userId;
        const method = isEdit ? 'update' : 'create';
        const form = {...this.state.form};

        form.roles = form.roles.map(({value}) => value);
        form.types = form.types.map(({value}) => value);

        if (!form.password && isEdit) delete form.password;
        if (!form.username) form.username = this.username;

        this.setState({inProgress: true}, () => {
            UserService[method](form, userId)
                .then(() => {
                    NotificationManager.success(
                        `Пользователь успешно ${isEdit ? 'обновлен' : 'создан'}`,
                        `${isEdit ? 'Редактирование' : 'Создание'} пользователя`
                    );
                    this.setState({inProgress: false});
                    this.props.onUpdateParent();
                    this.props.onClose();
                })
                .catch(() => this.setState({inProgress: false}));
        });
    };

    roleOptions = this.props.roles.map(({name, description}) => ({name, value: name, description}));

    username = '';

    render() {
        const {onClose, userId, userTypes} = this.props;
        const {form, inProgress} = this.state;
        const isEdit = !!userId;
        const userTypeOptions = userTypes.map(({id, name}) => ({name, value: id}));
        const canEdit = isAccess(PERMISSION.editUsers);

        return (
            <ConfirmModal
                title={`${isEdit ? 'Редактирование' : 'Создание'} пользователя`}
                onClose={onClose}
                onSubmit={() => this.form.submit()}
            >
                <Form
                    {...classes('form')}
                    onSubmit={this.handleSubmit}
                    ref={ref => this.form = ref}
                    validate
                >
                    <InputText
                        label='Фамилия'
                        placeholder='Фамилия'
                        disabled={!canEdit}
                        value={form.surname || ''}
                        onChange={value => this.handleChangeForm(value, 'surname')}
                    />

                    <InputText
                        label='Имя'
                        placeholder='Имя'
                        disabled={!canEdit}
                        value={form.name || ''}
                        onChange={value => this.handleChangeForm(value, 'name')}
                    />

                    <InputText
                        label='Логин'
                        placeholder='Логин'
                        required
                        disabled={!canEdit}
                        value={form.username || this.username }
                        onChange={value => this.handleChangeForm(value, 'username')}
                    />

                    <InputText
                        label='Отдел'
                        placeholder='Отдел'
                        disabled={!canEdit}
                        value={form.department || ''}
                        onChange={value => this.handleChangeForm(value, 'department')}
                    />

                    <Select
                        label='Роль'
                        required
                        options={this.roleOptions}
                        selected={form.roles}
                        disabled={!canEdit}
                        onChange={value => this.handleChangeForm(value, 'roles')}
                    />

                    <Select
                        label='Тип пользователя'
                        required
                        options={userTypeOptions}
                        selected={form.types}
                        disabled={!canEdit}
                        onChange={value => this.handleChangeForm(value, 'types')}
                    />

                    <InputText
                        label='Email'
                        type='email'
                        placeholder='example@mail.ru'
                        required
                        disabled={!canEdit}
                        value={form.email}
                        onChange={value => this.handleChangeForm(value, 'email')}
                    />

                    <InputText
                        label='Пароль'
                        type='password'
                        required={!isEdit}
                        disabled={!canEdit}
                        value={form.password || ''}
                        onChange={value => this.handleChangeForm(value, 'password')}
                    />
                </Form>

                {inProgress && <Loader/>}
            </ConfirmModal>
        );
    }
}

function mapStateToProps({roles, profile, userTypes}) {
    return {roles, profile, userTypes};
}

export default connect(mapStateToProps)(UserModal);
