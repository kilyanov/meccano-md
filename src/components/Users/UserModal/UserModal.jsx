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
        this.setState(({form}) => form[prop] = value);
    };

    handleSubmit = () => {
        const {userId} = this.props;
        const isEdit  = !!userId;
        const method = isEdit ? 'update' : 'create';
        const form = {...this.state.form};

        form.roles = form.roles.map(({value}) => value);
        form.types = form.types.map(({value}) => value);

        if (!form.password && isEdit) delete form.password;

        this.setState({inProgress: true}, () => {
            UserService[method](form, userId)
                .then(() => {
                    NotificationManager.success(
                        `Пользователь успешно ${isEdit ? 'обновлен' : 'создан'}`,
                        `${isEdit ? 'Редактирование' : 'Создание'} пользователя`
                    );
                    this.setState({inProgress: false});
                    this.props.onUpdateParent()
                    this.props.onClose();
                })
                .catch(() => this.setState({inProgress: false}));
        });
    };

    roleOptions = this.props.roles.map(({name, description}) => ({name, value: name, description}));

    render() {
        const {onClose, userId, userTypes} = this.props;
        const {form, inProgress} = this.state;
        const isEdit = !!userId;
        const userTypeOptions = userTypes.map(({id, name}) => ({name, value: id}));

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
                        label='Имя пользователя'
                        placeholder='Username'
                        required
                        value={form.username}
                        onChange={value => this.handleChangeForm(value, 'username')}
                    />

                    <Select
                        label='Роль'
                        required
                        options={this.roleOptions}
                        selected={form.roles}
                        onChange={value => this.handleChangeForm(value, 'roles')}
                    />

                    <Select
                        label='Тип пользователя'
                        required
                        options={userTypeOptions}
                        selected={form.types}
                        onChange={value => this.handleChangeForm(value, 'types')}
                    />

                    <InputText
                        label='Email'
                        type='email'
                        placeholder='example@mail.ru'
                        required
                        value={form.email}
                        onChange={value => this.handleChangeForm(value, 'email')}
                    />

                    <InputText
                        label='Пароль'
                        type='password'
                        required={!isEdit}
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
