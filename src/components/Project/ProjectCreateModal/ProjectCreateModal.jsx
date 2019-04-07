import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ConfirmModal from '../../Shared/ConfirmModal/ConfirmModal';
import InputText from '../../Form/InputText/InputText';
import './project-create-modal.scss';
import Form from '../../Form/Form/Form';
import { ProjectService } from '../../../services/ProjectService';
import { NotificationManager } from 'react-notifications';

const classes = new Bem('project-create-modal');

export default class ProjectCreateModal extends Component {
    static propTypes = {
        project: PropTypes.object,
        onClose: PropTypes.func
    };

    state = {
        form: {
            name: '',
            slug: '',
            sectionFirst: '',
            sectionSecond: '',
            sectionThird: '',
            medias: ''
        },
        inProgress: false
    };

    handleChangeForm = (value, option) => {
        this.setState(prevState => prevState.form[option] = value);
    };

    handleSubmit = () => {
        const {project} = this.props;
        const {form} = this.state;

        this.setState({inProgress: true}, () => {
            ProjectService.post(form).then(() => {
                NotificationManager.success(`Проект успешно ${project ? 'отредактирован' : 'создан'}`, 'Успех');
                this.setState({inProgress: false});
                this.props.onClose();
            });
        });
    };

    render() {
        const {project, onClose} = this.props;
        const {form} = this.state;

        return (
            <ConfirmModal
                {...classes()}
                title={`${project ? 'Редактирование' : 'Создание'} проекта`}
                onClose={onClose}
                onSubmit={() => this.form.submit()}
            >
                <Form onSubmit={this.handleSubmit} ref={node => this.form = node}>
                    <div {...classes('row', '', 'row')}>
                        <div {...classes('col', '', 'col-md-9')}>
                            <InputText
                                label='Наименование'
                                name='name'
                                value={form.name}
                                onChange={value => this.handleChangeForm(value, 'name')}
                            />
                        </div>

                        <div {...classes('col', '', 'col-md-3')}>
                            <InputText
                                label='Код проекта'
                                name='slug'
                                value={form.slug}
                                onChange={value => this.handleChangeForm(value, 'slug')}
                            />
                        </div>
                    </div>

                    <div {...classes('row', '', 'row')}>
                        <div {...classes('col', '', 'col-md-4')}>
                            <InputText
                                label='Раздел 1'
                                name='sectionFirst'
                                value={form.sectionFirst}
                                onChange={value => this.handleChangeForm(value, 'sectionFirst')}
                            />
                        </div>
                        <div {...classes('col', '', 'col-md-4')}>
                            <InputText
                                label='Раздел 2'
                                name='sectionSecond'
                                value={form.sectionSecond}
                                onChange={value => this.handleChangeForm(value, 'sectionSecond')}
                            />
                        </div>
                        <div {...classes('col', '', 'col-md-4')}>
                            <InputText
                                label='Раздел 3'
                                name='sectionThird'
                                value={form.sectionThird}
                                onChange={value => this.handleChangeForm(value, 'sectionThird')}
                            />
                        </div>
                    </div>

                    <div {...classes('row', '', 'row')}>
                        <div {...classes('col', '', 'col-md-4')}>
                            <InputText
                                label='Вид СМИ'
                                name='medias'
                                value={form.medias}
                                onChange={value => this.handleChangeForm(value, 'medias')}
                            />
                        </div>
                    </div>
                </Form>
            </ConfirmModal>
        );
    }
}
