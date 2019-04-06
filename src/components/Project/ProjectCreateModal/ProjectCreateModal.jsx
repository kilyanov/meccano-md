import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ConfirmModal from '../../Shared/ConfirmModal/ConfirmModal';
import InputText from '../../Form/InputText/InputText';
import './project-create-modal.scss';

const classes = new Bem('project-create-modal');

export default class ProjectCreateModal extends Component {
    static propTypes = {
        project: PropTypes.object,
        onClose: PropTypes.func
    };

    state = {
        form: {
            name: ''
        }
    };

    handleChangeForm = (value, option) => {
        this.setState(prevState => prevState.form[option] = value);
    };

    handleSubmit = () => {

    };

    render() {
        const {project, onClose} = this.props;
        const {form} = this.state;

        return (
            <ConfirmModal
                {...classes()}
                title={`${project ? 'Редактирование' : 'Создание'} проекта`}
                onClose={onClose}
                onSubmit={this.handleSubmit}
            >
                <InputText
                    autoFocus
                    label='Наименование'
                    value={form.name}
                    onChange={value => this.handleChangeForm(value, 'name')}
                />
            </ConfirmModal>
        );
    }
}
