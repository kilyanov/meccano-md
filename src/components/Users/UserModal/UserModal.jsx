import React, {Component} from 'react';
import PropTypes from 'prop-types';
import UserService from "../../../services/UserService";
import ConfirmModal from "../../Shared/ConfirmModal/ConfirmModal";
import Form from "../../Form/Form/Form";
import InputText from "../../Form/InputText/InputText";
import Loader from "../../Shared/Loader/Loader";
import {connect} from 'react-redux';
import {AuthService} from "../../../services";
import {NotificationManager} from "react-notifications";
import Select from "../../Form/Select/Select";

const classes = new Bem('user-modal');

class UserModal extends Component {
    static propTypes = {
        userId: PropTypes.string,
        onClose: PropTypes.func.isRequired,
    };

    state = {
        form: {
            username: '',
            password: '',
            email: '',
            role: 'admin'
        },
        inProgress: false
    };

    componentDidMount() {
        const {userId} = this.props;

        if (userId) {
            UserService.getProfile(userId).then(response => {
                console.log(response);
            });
        }
    }

    handleChangeForm = (value, prop) => {
        this.setState(({form}) => form[prop] = value);
    };

    handleSubmit = () => {
        const {userId} = this.props;
        const isEdit  = !!userId;
        const {form} = this.state;

        this.setState({inProgress: true}, () => {
            AuthService
                .create(form)
                .then(() => {
                    NotificationManager.success(
                        `Пользователь успешно ${isEdit ? 'обновлен' : 'создан'}`,
                        `${isEdit ? 'Редактирование' : 'Создание'} пользователя`
                    );
                    this.setState({inProgress: false});
                })
                .catch(() => this.setState({inProgress: false}));
        });
    };

    roleOptions = this.props.roles.map(({name, description}) => ({name, value: name, description}));

    render() {
        const {onClose, userId} = this.props;
        const {form, inProgress} = this.state;
        const isEdit = !!userId;
        
        console.log(this.props.roles);

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
                        placeholder='user'
                        required
                        value={form.username}
                        onChange={value => this.handleChangeForm(value, 'username')}
                    />

                    <Select
                        label='Роль'
                        options={this.roleOptions}
                        selected={form.role}
                        onChange={value => this.handleChangeForm(value, 'role')}
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
                        required
                        value={form.password}
                        onChange={value => this.handleChangeForm(value, 'password')}
                    />
                </Form>

                {inProgress && <Loader/>}
            </ConfirmModal>
        );
    }
}

function mapStateToProps({roles, profile}) {
    return {
        roles,
        profile
    };
}

export default connect(mapStateToProps)(UserModal);
