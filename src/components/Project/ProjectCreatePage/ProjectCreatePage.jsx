import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Page from '../../Shared/Page/Page';
import Button from '../../Shared/Button/Button';
import './project-create-page.scss';
import ProjectSections from './ProjectSections/ProjectSections';
import Loader from '../../Shared/Loader/Loader';
import { ProjectService } from '@services';
import PromiseDialogModal from '../../Shared/PromiseDialogModal/PromiseDialogModal';
import { NotificationManager } from 'react-notifications';
import ProjectProperties from './ProjectProperties/ProjectProperties';
import PencilIcon from "../../Shared/SvgIcons/PencilIcon";
import InlineButton from "../../Shared/InlineButton/InlineButton";
import { KEY_CODE, EVENTS } from "@const";
import { OperatedNotification } from '@helpers/Tools';
import ProjectKeyWords from './ProjectKeyWords/ProjectKeyWords';
import { EventEmitter } from "../../../helpers";
import { deleteProject, updateProject } from "../../../redux/actions";
import store from "../../../redux/store";
import Select from "react-select";
import ProjectUsers from "./ProjectUsers/ProjectUsers";
import Access from "../../Shared/Access/Access";
import { PROJECT_PERMISSION } from "@const";

const cls = new Bem('project-create-page');
const STEP_DESCRIPTION = {
    1: 'Настройка полей',
    2: 'Создание структуры',
    3: 'Настройка ключевых слов',
    4: 'Настройка пользователей'
};

class ProjectCreatePage extends Component {
    static contextTypes = {
        router: PropTypes.object
    };

    state = {
        step: 1,
        projectId: this.props.match.params.id,
        project: null,
        roleFields: {
            monitor: [],
            analytic: [],
            client: []
        },
        projectFields: [],
        allFields: [],
        sections: [],
        wordSearch: [],
        userTypes: [],
        isEdit: false,
        isEditTitle: false,
        editTitleValue: '',
        selectedUserType: null,
        inProgress: true
    };

    componentDidMount() {
        this.getProject();
        this.getUserTypes();
        document.addEventListener('click', this.handleClickOutside, true);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.userTypes.length !== this.props.userTypes.length) {
            this.getUserTypes();
        }
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

    handleChangeSelectedFields = (newFieldSet) => {
        const { projectFields, selectedUserType } = this.state;

        projectFields.forEach(fieldSet => {
            if (fieldSet.user_type_id === selectedUserType.value) {
                fieldSet.data = newFieldSet;
            }
        });

        this.setState({ projectFields });
    };

    handleClickBackButton = () => {
        const { step } = this.state;

        if (step === 2) {
            this.setState({ step: 1 });
        } else {
            this.deleteProject();
        }
    };

    handleChangeSections = (sections) => {
        this.setState({ sections });
    };

    handleStartEditTile = () => {
        this.setState({
            isEditTitle: true,
            editTitleValue: this.state.project.name
        });
    };

    handleEditTitle = (event) => {
        const value = event.target.value;

        this.setState({ editTitleValue: value });
    };

    handleEndEditTitle = () => {
        const wasBeenChanged = this.state.project.name !== this.state.editTitleValue;

        this.setState((state) => {
            state.project.name = state.editTitleValue;
            state.editTitleValue = '';
            state.isEditTitle = false;

            return state;
        }, () => {
            const { projectId, project } = this.state;

            if (wasBeenChanged) {
                ProjectService
                    .put(projectId, { name: project.name })
                    .then(response => {
                        store.dispatch(updateProject(response.data));
                        NotificationManager.success('Проект был успешно переименован', 'Обновление проекта');
                    })
                    .catch((e) => console.log(e));
            }
        });
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

    handleCreateField = (field) => {
        this.setState(({ allFields }) => allFields.unshift(field));
    };

    handleEditField = (field) => {
        this.setState(({ allFields }) => {
            return { allFields: allFields.map(f => f.id === field.id ? field : f) };
        });
    };

    handleSubmit = () => {
        switch (this.state.step) {
            case 1:
                this.saveFields();
                break;
            case 2:
                this.saveSections();
                break;
            case 3:
                this.setState({ step: 4 });
                break;
            default:
                EventEmitter.emit(EVENTS.REDIRECT, `/project/${this.projectId}`);
        }
    };

    getProject = () => {
        const params = {
            expand: 'projectFields,allFields'
        };

        ProjectService.get(params, this.projectId).then(projectResponse => {
            const { projectFields, allFields, createdAt, updatedAt } = projectResponse.data;

            projectFields.forEach(fieldsByUserType => {
                fieldsByUserType.data = fieldsByUserType.data.sort((a, b) => a.order - b.order);
            });

            this.project = projectResponse.data;
            this.project.allFields = allFields;
            this.setState({
                projectFields,
                allFields,
                project: this.project,
                isEdit: createdAt !== updatedAt,
                inProgress: false
            });
        }).catch(() => this.setState({ inProgress: false }));
    };

    getUserTypes = () => {
        const userTypes = this.props.userTypes.map(({ id, name }) => ({ label: name, value: id }));

        this.setState({
            userTypes,
            selectedUserType: userTypes[0]
        });
    };

    getStepsButtons = () => {
        const { projectFields } = this.state;

        if (!projectFields || !projectFields.length) return [];

        const hasSectionsFields = this.hasSectionsFields();
        const stepsButtons = Object.keys(STEP_DESCRIPTION).map(key => {
            const active = +key === this.state.step;

            return (
                <button
                    {...cls('steps-buttons-item', { active, disabled: (+key === 2 && !hasSectionsFields) })}
                    key={key}
                    disabled={(+key === 2 && !hasSectionsFields) || active}
                    onClick={() => this.setState({ step: +key, inProgress: false })}
                >Шаг {key}: {STEP_DESCRIPTION[key]}</button>
            );
        });

        const divider = <span {...cls('steps-buttons-divider')} />;

        return (
            <div {...cls('steps-buttons')}>
                {stepsButtons.map((button, buttonIndex) => (
                    buttonIndex < stepsButtons.length - 1 ? (
                        <Fragment key={buttonIndex}>
                            {button}
                            {divider}
                        </Fragment>
                    ) : button
                ))}
            </div>
        );
    };

    saveFields = () => {
        this.setState({ inProgress: true }, () => {
            this.state.projectFields.forEach(fieldsByType => {
                fieldsByType.data.forEach((field, index) => {
                    field.order = index;
                    delete field.hignlightedName;
                });
            });

            ProjectService
                .put(this.state.projectId, { projectFields: this.state.projectFields })
                .then(response => {
                    store.dispatch(updateProject(response.data));

                    this.setState({ step: this.hasSectionsFields() ? 2 : 3, inProgress: false });
                })
                .catch(() => this.setState({ inProgress: false }));
        });
    };

    saveSections = () => {
        const { step, sections } = this.state;

        if (step === 2 && (!sections || !sections.length)) return;

        function removeGeneratedIds(arr) {
            arr.forEach(item => {
                if (item.id && item.id.includes('new_')) {
                    delete item.id;
                }

                if (item.sectionsTwo || item.sectionsThree) {
                    removeGeneratedIds(item.sectionsTwo || item.sectionsThree);
                }
            });
        }

        removeGeneratedIds(sections);

        this.setState({ inProgress: true }, () => {
            ProjectService.sections.create(
                this.projectId,
                sections
            ).then(() => {
                this.setState({ step: 3, inProgress: false });
            }).catch(() => this.setState({ inProgress: false }));
        });
    };

    saveProject = () => {
        const { project, projectFields } = this.state;

        project.projectFields = projectFields;

        this.setState({ inProgress: true }, () => {
            ProjectService.put(this.state.projectId, project).then(response => {
                store.dispatch(updateProject(response.data));
                OperatedNotification.success({
                    title: 'Обновление проекта',
                    message: 'Проект успешно обновлен',
                    submitButtonText: 'Перейти к проекту →',
                    cancelButtonText: 'Продолжить',
                    timeOut: 10000,
                    onSubmit: () => EventEmitter.emit(EVENTS.REDIRECT, `/project/${this.projectId}`)
                });
                this.setState({ inProgress: false });
            }).catch(() => this.setState({ inProgress: false }));
        });
    };

    deleteProject = () => {
        const { isEdit } = this.state;

        this.promiseDialogModal.open({
            title: isEdit ? 'Удаление проекта' : 'Отмена создания проекта',
            content: `Вы уверены, что хотите ${
                isEdit ? 'удалить проект' : 'отменить создание проекта'
            } "${this.project.name}"?`,
            style: 'danger',
            danger: true,
            submitText: isEdit ? 'Удалить' : 'Отменить создание'
        }).then(() => {
            ProjectService.delete(this.projectId).then(() => {
                NotificationManager.success('Проект был удален', 'Удаление проекта');
                store.dispatch(deleteProject(this.projectId));
                EventEmitter.emit(EVENTS.REDIRECT, '/');
            });
        });
    };

    hasSectionsFields = () => {
        // Проверяем на наличие полей sections
        const { selectedUserType, projectFields } = this.state;

        if (!projectFields || !projectFields.length) return false;

        const fields = selectedUserType
            ? projectFields.find(field => field.user_type_id === selectedUserType.value)
            : projectFields[0];

        // Проверяем на наличие полей sections
        const foundSections = fields.data.find(({ slug }) => {
            return [ 'section_main_id', 'section_sub_id', 'section_three_id' ].includes(slug);
        });

        return !!foundSections;
    };

    projectId = this.props.match.params.id;

    project = null;

    render() {
        const { roles } = this.props;
        const {
            step,
            projectFields,
            allFields,
            sections,
            isEdit,
            project,
            userTypes,
            isEditTitle,
            editTitleValue,
            selectedUserType,
            inProgress
        } = this.state;
        const backButtonLabel = step === 2 ? 'Назад' : isEdit ? 'Удалить проект' : 'Отменить создание';
        const fieldsByUserType = selectedUserType && projectFields.find(f => f.user_type_id === selectedUserType.value);

        return (
            <Access
                projectPermissions={[ PROJECT_PERMISSION.PROJECT_MANAGER ]}
                roles={[ roles.admin ]}
                redirect='/'
            >
                <Page
                    withBar
                    withContainerClass={false}
                    {...cls()}
                >
                    <section {...cls('header')}>
                        <div {...cls('container', '', 'container')}>
                            <div {...cls('breadcrumbs')}>
                                {isEdit ? 'Редактирование' : 'Создание'} проекта:
                                {this.getStepsButtons()}
                            </div>

                            {project && (
                                isEditTitle ?
                                    <div
                                        {...cls('title-input-container')}
                                        ref={ref => this.titleInputContainer = ref}
                                    >
                                        <input
                                            autoFocus
                                            type='text'
                                            {...cls('title-input')}
                                            onChange={this.handleEditTitle}
                                            onKeyDown={this.handleInputKeyDown}
                                            value={editTitleValue}
                                        />
                                        <InlineButton
                                            {...cls('title-input-button')}
                                            text='Переименовать'
                                            onClick={this.handleEndEditTitle}
                                            disabled={!project.name.length}
                                        />
                                    </div> :
                                    <div {...cls('title-container')} onClick={this.handleStartEditTile}>
                                        <h2 {...cls('title')}>{project.name}</h2>
                                        <PencilIcon
                                            {...cls('title-edit-icon')}
                                            size={{ width: 20, height: 20 }}
                                        />
                                    </div>
                            )}

                            {(!!userTypes.length && step === 1) && (
                                <Select
                                    {...cls('viewer-select')}
                                    options={userTypes}
                                    value={selectedUserType}
                                    onChange={value => this.setState({ selectedUserType: value })}
                                />
                            )}
                        </div>
                    </section>

                    <section {...cls('body')}>
                        {(this.project && step === 1 && projectFields && fieldsByUserType) && (
                            <ProjectProperties
                                classes={cls}
                                project={this.project}
                                fields={fieldsByUserType.data || []}
                                allFields={allFields || []}
                                onChange={this.handleChangeSelectedFields}
                                onCreateField={this.handleCreateField}
                                onEditField={this.handleEditField}
                            />
                        )}

                        {(this.project && step === 2) && (
                            <ProjectSections
                                projectId={this.projectId}
                                classes={cls}
                                sections={sections}
                                onChange={this.handleChangeSections}
                            />
                        )}

                        {(this.project && step === 3) && (
                            <ProjectKeyWords projectId={this.projectId}/>
                        )}

                        {(this.project && step === 4) && (
                            <ProjectUsers projectId={this.projectId}/>
                        )}
                    </section>

                    <section {...cls('footer')}>
                        <div {...cls('container', '', 'container')}>
                            <Button
                                onClick={this.handleClickBackButton}
                                {...cls('cancel-button')}
                                style={isEdit && step !== 2 ? 'error' : 'default'}
                                viewType='inline'
                                text={backButtonLabel}
                            />
                            <Button
                                to={`/project/${this.projectId}`}
                                {...cls('submit-button', 'margin-left-auto')}
                                style='inline'
                                text='Перейти к проекту'
                            />
                            {([ 1, 2, 3 ].includes(step) && isEdit) && (
                                <Button
                                    onClick={() => step === 2 ? this.saveSections() : this.saveProject()}
                                    {...cls('submit-button', 'margin-left-auto')}
                                    style='inline'
                                    text='Сохранить'
                                />
                            )}
                            <Button
                                onClick={this.handleSubmit}
                                {...cls('submit-button')}
                                disabled={step === 2 && !sections.length}
                                style='success'
                                text={step === 4 ? 'Сохранить' : 'Далее'}
                            />
                        </div>
                    </section>

                    <PromiseDialogModal ref={node => this.promiseDialogModal = node}/>

                    {(!this.project || inProgress) && <Loader fixed/>}
                </Page>
            </Access>
        );
    }
}

function mapStateToProps(state) {
    const roles = {};

    state.roles.forEach(({ name }) => roles[name] = name);

    return {
        profile: state.profile,
        userTypes: state.userTypes,
        roles
    };
}

export default connect(mapStateToProps)(ProjectCreatePage);
