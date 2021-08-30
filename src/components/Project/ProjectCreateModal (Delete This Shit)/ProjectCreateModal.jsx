import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ConfirmModal from '../../Shared/ConfirmModal/ConfirmModal';
import InputText from '../../Form/InputText/InputText';
import './project-create-modal.scss';
import Form from '../../Form/Form/Form';
import {ProjectService} from '../../../services';
import {NotificationManager} from 'react-notifications';
import Loader from '../../Shared/Loader/Loader';
import {EventEmitter} from "../../../helpers";
import {EVENTS} from "../../../constants";
import store from "../../../redux/store";
import {addProject} from "../../../redux/actions";

const cls = new Bem('project-create-modal');

export default class ProjectCreateModal extends Component {
    static propTypes = {
        project: PropTypes.object,
        onClose: PropTypes.func
    };

    static contextTypes = {
        router: PropTypes.object
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
            ProjectService.post(form).then(response => {
                NotificationManager.success(
                    `Проект успешно ${project ? 'отредактирован' : 'создан'}`,
                    `${project ? 'Создание проекта' : 'Редактирование проекта'}`
                );

                this.setState({inProgress: false}, () => {
                    this.props.onClose();
                    store.dispatch(addProject(response.data));
                    EventEmitter.emit(EVENTS.REDIRECT, `/project-create/${response.data.id}`);
                });
            });
        });
    };

    render() {
        const {project, onClose} = this.props;
        const {form, inProgress} = this.state;

        return (
            <ConfirmModal
                {...cls()}
                title={`${project ? 'Редактирование' : 'Создание'} проекта`}
                onClose={onClose}
                onSubmit={() => this.form.submit()}
                submitText='Создать'
            >
                <Form
                    onSubmit={this.handleSubmit}
                    ref={node => this.form = node}
                    validate
                >
                    <div {...cls('row', '', 'row')}>
                        <div {...cls('col', '', 'col-md-9')}>
                            <InputText
                                autoFocus
                                label='Наименование'
                                name='name'
                                required
                                value={form.name}
                                onChange={value => this.handleChangeForm(value, 'name')}
                            />
                        </div>

                        <div {...cls('col', '', 'col-md-3')}>
                            <InputText
                                label='Код проекта'
                                name='slug'
                                value={form.slug}
                                onChange={value => this.handleChangeForm(value, 'slug')}
                            />
                        </div>
                    </div>
                </Form>

                {inProgress && <Loader/>}
            </ConfirmModal>
        );
    }
}
