import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Page from '../../Shared/Page/Page';
import Button from '../../Shared/Button/Button';
import './project-create-page.scss';
import ProjectCreateFirstStep from './ProjectCreateFirstStep';
import ProjectCreateSecondStep from './ProjectCreateSecondStep';
import Loader from '../../Shared/Loader/Loader';
import {ProjectService} from '../../../services';
import PromiseDialogModal from '../../Shared/PromiseDialogModal/PromiseDialogModal';
import {NotificationManager} from 'react-notifications';
import {EventEmitter} from '../../../helpers';
import store from '../../../redux/store';
import {deleteProject} from '../../../redux/actions';

const classes = new Bem('project-create-page');

class ProjectCreatePage extends Component {
    static propTypes = {
        projects: PropTypes.array.isRequired
    };

    state = {
        step: 2,
        projectId: this.props.match.params.id,
        fields: [],
        allFields: [],
        isEdit: false,
        inProgress: true
    };

    componentDidMount() {
        const params = {
            expand: 'fields,allFields'
        };

        ProjectService.get(this.projectId, params).then(response => {
            const {fields, allFields, createdAt, updatedAt} = response.data;
            const isEdit = createdAt !== updatedAt;

            console.log('isEdit', isEdit);

            this.setState({
                fields,
                allFields: allFields.filter(({code}) => !fields.find(f => f.code === code)),
                isEdit: createdAt !== updatedAt,
                inProgress: false
            });
        });
    }

    handleChangeSelectedFields = (fields) => {
        this.setState({...fields});
    };

    handleDeleteProject = () => {
        const {isEdit} = this.state;

        this.promiseDialogModal.open({
            title: isEdit ? 'Удаление проекта' : 'Отмена создания проекта',
            content: `Вы уверены, что хотите ${
                isEdit ? 'удалить проект' : 'отменить создание проекта'
            } \b"${this.project.name}"\b?`,
            style: 'danger',
            submitText: isEdit ? 'Удалить' : 'Отменить создание'
        }).then(() => {
            ProjectService.delete(this.projectId).then(() => {
                store.dispatch(deleteProject(this.projectId));
                NotificationManager.success('Проект был удален', 'Успех');
                EventEmitter.emit('redirect', '/');
            });
        });
    };

    handleSubmit = () => {
        this.setState({inProgress: true}, () => {
            const fields = this.state.fields.map((field, index) => {
                field.order = index;
                return field;
            });

            ProjectService.put(this.state.projectId, {fields}).then(() => {
                this.setState({step: 2, inProgress: false});
            });
        });
    };

    getProject = () => {
        if (this.project && this.project.id === this.projectId) {
            return this.project;
        } else if (this.props.projects.length) {
            this.project = this.props.projects.find(({id}) => id === this.projectId);

            return this.project;
        }
    };

    projectId = this.props.match.params.id;

    project = null;

    render() {
        const { step, fields, allFields, isEdit, inProgress } = this.state;
        const project = this.getProject();

        return (
            <Page
                withBar
                withContainerClass={false}
                {...classes()}
            >
                <section {...classes('header')}>
                    <div {...classes('container', '', 'container')}>
                        <div {...classes('breadcrumbs')}>
                            {isEdit ? 'Редактирование' : 'Создание'} проекта: {this.step === 1 ?
                                'Шаг 1 - Настройка полей' : 'Шаг 2: Создание структуры'}
                        </div>

                        {project && <h2 {...classes('title')}>{project.name}</h2>}
                    </div>
                </section>

                <section {...classes('body')}>
                    {(project && step === 1) && (
                        <ProjectCreateFirstStep
                            classes={classes}
                            project={project}
                            fields={fields || []}
                            allFields={allFields || []}
                            onChange={this.handleChangeSelectedFields}
                        />
                    )}

                    {(project && step === 2) && (
                        <ProjectCreateSecondStep
                            classes={classes}
                            project={project}
                        />
                    )}
                </section>

                <section {...classes('footer')}>
                    <div {...classes('container', '', 'container')}>
                        <Button
                            onClick={this.handleDeleteProject}
                            {...classes('cancel-button')}
                            style={isEdit ? 'error' : 'default'}
                            viewType='inline'
                            text={isEdit ? 'Удалить проект' : `Отменить создание`}
                        />
                        <Button
                            onClick={this.handleSubmit}
                            {...classes('submit-button')}
                            style='success'
                            text='Далее'
                        />
                    </div>
                </section>

                <PromiseDialogModal ref={node => this.promiseDialogModal = node} />

                {(!project || inProgress) && <Loader fixed/>}
            </Page>
        );
    }
}

export default connect(({projects}) => ({projects}))(ProjectCreatePage);
