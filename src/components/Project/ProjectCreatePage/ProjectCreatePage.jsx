import React, {Component} from 'react';
import Page from '../../Shared/Page/Page';
import Button from '../../Shared/Button/Button';
import './project-create-page.scss';
import ProjectCreateSecondStep from './ProjectCreateSecondStep';
import Loader from '../../Shared/Loader/Loader';
import {ProjectService} from '../../../services';
import PromiseDialogModal from '../../Shared/PromiseDialogModal/PromiseDialogModal';
import {NotificationManager} from 'react-notifications';
import {EventEmitter} from '../../../helpers';
import ProjectProperties from './ProjectProperties/ProjectProperties';
import {EVENTS} from '../../../constants/Events';
import PencilIcon from "../../Shared/SvgIcons/PencilIcon";
import InlineButton from "../../Shared/InlineButton/InlineButton";
import {KEY_CODE} from "../../../constants";

const classes = new Bem('project-create-page');

export default class ProjectCreatePage extends Component {
    state = {
        step: 1,
        projectId: this.props.match.params.id,
        project: null,
        fields: [],
        allFields: [],
        sections: [],
        isEdit: false,
        isEditTitle: false,
        editTitleValue: '',
        inProgress: true
    };

    componentDidMount() {
        const params = {
            expand: 'fields,allFields'
        };

        ProjectService.get(params, this.projectId).then(response => {
            const {fields, allFields, createdAt, updatedAt} = response.data;
            // const isEdit = createdAt !== updatedAt;

            this.project = response.data;
            this.setState({
                fields,
                allFields, // allFields.filter(({code}) => !fields.find(f => f.code === code))
                project: response.data,
                isEdit: createdAt !== updatedAt,
                inProgress: false
            });
        });
        document.addEventListener('click', this.handleClickOutside, true);
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.handleClickOutside, true);
    }

    handleClickOutside = (event) => {
        const isInnerClick = this.titleInputContainer && this.titleInputContainer.contains(event.target);

        if (this.state.isEditTitle && !isInnerClick) {
            this.setState({
                editTitleValue: '',
                isEditTitle: false
            });
        }
    };

    handleChangeSelectedFields = (fields) => {
        this.setState({fields});
    };

    handleClickBackButton = () => {
        const {step} = this.state;

        if (step === 2) this.setState({step: 1});
        else this.deleteProject();
    };

    handleChangeSections = (sections) => {
        this.setState({sections});
    };

    handleStartEditTile = () => {
        this.setState({
            isEditTitle: true,
            editTitleValue: this.state.project.name
        });
    };

    handleEditTitle = (event) => {
        const value = event.target.value;

        this.setState({editTitleValue: value});
    };

    handleEndEditTitle = () => {
        const newState = {...this.state};

        newState.project.name = newState.editTitleValue;
        newState.editTitleValue = '';
        newState.isEditTitle = false;

        this.setState(newState);
    };

    handleInputKeyDown = (event) => {
        switch (event.keyCode) {
            case KEY_CODE.esc:
                this.setState({
                    editTitleValue: '',
                    isEditTitle: false
                });
                break;
            case KEY_CODE.enter:
                this.handleEndEditTitle();
                break;
            default:
                break;
        }
    };

    handleSubmit = () => {
        if (this.state.step === 1) {
            this.setState({inProgress: true}, () => {
                const fields = this.state.fields.map((field, index) => {
                    field.order = index;
                    return field;
                });

                ProjectService.put(this.state.projectId, {fields}).then(() => {
                    // Проверяем на наличие полей sections
                    const found = this.state.fields.find(({code}) => {
                        return ['section_main_id', 'section_sub_id', 'section_three_id'].includes(code);
                    });

                    if (!found) {
                        return EventEmitter.emit(EVENTS.REDIRECT, `/project/${this.projectId}`);
                    }

                    this.setState({step: 2, inProgress: false});
                }).catch(() => this.setState({inProgress: false}));
            });
        } else {
            const {sections} = this.state;

            if (!sections || !sections.length) return;

            this.setState({inProgress: true}, () => {
                ProjectService.createSections(this.projectId, sections).then(() => {
                    setTimeout(() => EventEmitter.emit(EVENTS.REDIRECT, `/project/${this.projectId}`), 2000);
                }).catch(() => this.setState({inProgress: false}));
            });
        }
    };

    deleteProject = () => {
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
                NotificationManager.success('Проект был удален', 'Успех');
                EventEmitter.emit(EVENTS.REDIRECT, '/');
            });
        });
    };

    projectId = this.props.match.params.id;

    project = null;

    render() {
        const {
            step,
            fields,
            allFields,
            sections,
            isEdit,
            project,
            isEditTitle,
            editTitleValue,
            inProgress
        } = this.state;
        const backButtonLabel = step === 2 ? 'Назад' :
            isEdit ? 'Удалить проект' : 'Отменить создание';

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

                        {project && (
                            isEditTitle ?
                                <div
                                    {...classes('title-input-container')}
                                    ref={ref => this.titleInputContainer = ref}
                                >
                                    <input
                                        autoFocus
                                        type='text'
                                        {...classes('title-input')}
                                        onChange={this.handleEditTitle}
                                        onKeyDown={this.handleInputKeyDown}
                                        value={editTitleValue}
                                    />
                                    <InlineButton
                                        {...classes('title-input-button')}
                                        text='Переименовать'
                                        onClick={this.handleEndEditTitle}
                                        disabled={!project.name.length}
                                    />
                                </div> :
                                <div {...classes('title-container')} onClick={this.handleStartEditTile}>
                                    <h2 {...classes('title')}>{project.name}</h2>
                                    <PencilIcon
                                        {...classes('title-edit-icon')}
                                        size={{width: 20, height: 20}}
                                    />
                                </div>
                        )}
                    </div>
                </section>

                <section {...classes('body')}>
                    {(this.project && step === 1 && (fields.length || allFields.length)) && (
                        <ProjectProperties
                            classes={classes}
                            project={this.project}
                            fields={fields || []}
                            allFields={allFields || []}
                            onChange={this.handleChangeSelectedFields}
                        />
                    )}

                    {(this.project && step === 2) && (
                        <ProjectCreateSecondStep
                            projectId={this.projectId}
                            classes={classes}
                            sections={sections}
                            onChange={this.handleChangeSections}
                        />
                    )}
                </section>

                <section {...classes('footer')}>
                    <div {...classes('container', '', 'container')}>
                        <Button
                            onClick={this.handleClickBackButton}
                            {...classes('cancel-button')}
                            style={isEdit && step !== 2 ? 'error' : 'default'}
                            viewType='inline'
                            text={backButtonLabel}
                        />
                        <Button
                            onClick={this.handleSubmit}
                            {...classes('submit-button')}
                            disabled={step === 2 && !sections.length}
                            style='success'
                            text='Далее'
                        />
                    </div>
                </section>

                <PromiseDialogModal ref={node => this.promiseDialogModal = node} />

                {(!this.project || inProgress) && <Loader fixed/>}
            </Page>
        );
    }
}
