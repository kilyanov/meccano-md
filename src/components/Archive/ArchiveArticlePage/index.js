import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Page from '../../Shared/Page/Page';
import {
    ArchiveService,
    ArticleService,
    LocationService,
    ProjectService,
    SourceService,
    StorageService
} from '../../../services';
import './archive-create-page.scss';
import Form from '../../Form/Form/Form';
import Loader from '../../Shared/Loader/Loader';
import ArrowIcon from '../../Shared/SvgIcons/ArrowIcon';
import ArticleViewSettings from './ArticleViewSettings/ArticleViewSettings';
import ProjectCreateField from '../../Project/ProjectCreatePage/ProjectCreatePageField/ProjectCreatePageField';
import Sortable from 'react-sortablejs';
import { isMobileScreen, isProjectAccess, isRolesAccess, OperatedNotification } from '../../../helpers/Tools';
import { STORAGE_KEY } from '../../../constants';
import { EventEmitter } from "../../../helpers";
import { EVENTS } from "../../../constants";
import store from "../../../redux/store";
import { setCurrentProject } from "../../../redux/actions/currentProject";
import { PROJECT_PERMISSION } from "../../../constants";
import { KEY_CODE } from "../../../constants";
import TinyMCE from "../../Form/TinyMCE/TinyMCE";
import CreateLocationModal from "./CreateLocationModal";
import { setCurrentArticle, clearCurrentArticle, setCurrentArchive } from '../../../redux/actions';
import Breadcrumbs from '../../Shared/Breadcrumbs';

const cls = new Bem('archive-create-page');
const defaultTimeZone = 'Europe/Moscow';
const toDateWithoutTimeZone = (date) => {
    if (!date) return new Date();
    const removeTimeZone = moment(date).format('YYYY-MM-DD HH:mm:ss');

    return new Date(removeTimeZone);
};
const sectionsSet = {
    'section_main_id': 'sectionsTwo',
    'section_sub_id': 'sectionsThree'
};

class ArchiveArticlePage extends Component {
    static propTypes = {
        country: PropTypes.array,
        city: PropTypes.array,
        federal: PropTypes.array,
        region: PropTypes.array
    };

    static contextTypes = {
        router: PropTypes.object
    };

    constructor(props) {
        super(props);

        const archiveId = props.match.params.archiveId;

        this.defaultForm = {
            title: '',
            source_id: null,
            date: new Date(),
            media: '',
            url: '',
            archiveId,
            section_main_id: null,
            section_sub_id: null,
            section_three_id: null,
            authors: [],
            number: '',
            annotation: '',
            text: ''
        };
        const storageUserType = StorageService.get(STORAGE_KEY.USER_TYPE);
        const userType = storageUserType ? JSON.parse(storageUserType) : null;

        this.state = {
            articleId: props.match.params.articleId,
            archiveId,
            articlesNavs: {},
            projectFields: [],
            sources: [],
            prevForm: _.clone(this.defaultForm),
            form: _.clone(this.defaultForm),
            selectedMedia: {},
            viewType: StorageService.get(STORAGE_KEY.ARTICLE_VIEW_TYPE) || 1,
            userTypeId: userType && userType.id || null,
            userType: userType || null,
            showViewSettings: false,
            textIsChanged: false,
            annotationIsChanged: false,
            timeZone: defaultTimeZone,
            inProgress: true
        };
    }

    componentDidMount() {
        this.setUserType();
        EventEmitter.on(EVENTS.USER.CHANGE_TYPE, this.setUserType);
        document.addEventListener('keydown', this.handleDocumentKeyDown);

        if (this.state.articleId) {
            StorageService.set(STORAGE_KEY.LAST_VIEWED_ARTICLE, this.state.articleId);

            if (this.state.userTypeId) {
                this.getArticle();
            }
        } else {
            ProjectService
                .get({ expand: 'projectFields,sections,users' }, this.state.projectId)
                .then(response => {
                    const { userTypeId } = this.state;
                    const project = response.data;

                    if (!this.props.currentProject) {
                        store.dispatch(setCurrentProject(project));
                    }

                    if (project && project.projectFields) {
                        const projectFields = project.projectFields.find(f => f.user_type_id === userTypeId);

                        if (projectFields && projectFields.data) {
                            projectFields.data = projectFields.data.sort((a, b) => a.order - b.order);
                        }

                        this.setState({
                            sections: project.sections,
                            projectFields: projectFields && projectFields.data,
                            inProgress: false
                        }); // , this.getAdditionalDataFields
                    }
                })
                .catch(() => this.setState({ inProgress: false }));
        }

        if (this.props.profile) {
            this.setState({ timeZone: this.props.profile.timeZone });
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.match.params.articleId !== this.props.match.params.articleId) {
            this.setState({ articleId: this.props.match.params.articleId }, this.getArticle);
        }

        if (!_.isEqual(prevProps.userTypes, this.props.userTypes)) {
            this.setUserType();
        }

        if (prevState.userTypeId !== this.state.userTypeId) {
            this.getArticle();
        }

        if (prevProps.profile !== this.props.profile) {
            this.setState({ timeZone: this.props.profile.timeZone });
        }
    }

    componentWillUnmount() {
        EventEmitter.off(EVENTS.USER.CHANGE_TYPE, this.setUserType);
        document.removeEventListener('keydown', this.handleDocumentKeyDown);
        this.props.clearCurrentArticle();
    }

    handleChangeForm = (value, option) => {
        const newState = this.state;

        newState.form[option] = _.get(value, 'value', value); // if object and has "value"

        if (option === 'section_main_id') {
            newState.sectionsTwo = value ? value.sectionsTwo : [];
            newState.sectionsThree = [];
            newState.form.section_sub_id = null;
            newState.form.section_three_id = null;
        }

        if (option === 'section_sub_id') {
            newState.sectionsThree = value ? value.sectionsThree : [];
            newState.form.section_three_id = null;
        }

        this.setState(newState);
    };

    handleChangeViewType = (key) => {
        this.setState({ viewType: key });
    };

    handlePrevArticle = () => {
        const { location, history } = this.props;
        const { articlesNavs, archiveId } = this.state;
        const sp = new URLSearchParams(location.search);

        if (!articlesNavs.prev) return;

        history.push(`/archive/${archiveId}/article/${articlesNavs.prev}?page=${sp.get('page')}`);
    };

    handleNextArticle = () => {
        const { location, history } = this.props;
        const { articlesNavs, archiveId } = this.state;
        const sp = new URLSearchParams(location.search);

        if (!articlesNavs.next) return;

        history.push(`/archive/${archiveId}/article/${articlesNavs.next}?page=${sp.get('page')}`);
    };

    handleClickBackButton = () => {
        const { location } = this.props;
        const { projectId, archiveId } = this.state;
        const sp = new URLSearchParams(location.search);

        EventEmitter.emit(EVENTS.REDIRECT, `/archive/${projectId}/${archiveId}/?page=${sp.get('page')}`);
    };

    handleEndSort = (sortedKeys) => {
        const { projectFields } = this.state;

        sortedKeys.push(...this.unSortableFields);
        const sortedList = sortedKeys.map((key, index) => {
            const item = projectFields.find(({ slug }) => slug === key);

            if (item) item.order = index;

            return item;
        });

        sortedList.push(
            ...this.unSortableFields.map(key => projectFields.find(({ slug }) => slug === key))
        );

        this.setState({ projectFields: sortedList.filter(item => !!item) }, this.saveFieldsSort);
    };

    handleSubmit = () => {
        const form = _.cloneDeep(this.state.form);
        const isUpdate = !!this.state.articleId;
        const invalidateFields = [];

        form.date = moment(form.date).format();
        form.project_id = this.state.projectId;

        if (form.authors && form.authors.length) {
            form.authors = form.authors.map(({ label, value }) => ({ id: value, name: label }));
        }

        delete form.project;
        delete form.source;

        form.text = form.text.replace(/\r\n|\r|\n/g, '');
        form.annotation = form.annotation.replace(/\r\n|\r|\n/g, '');

        [ 'section_main_id', 'section_sub_id', 'section_three_id' ]
            .forEach(option => {
                if (form[option] && form[option].value) {
                    form[option] = form[option].value;
                }
            });

        // Check required
        this.state.projectFields
            .filter(({ required }) => required)
            .forEach(field => {
                if (!form[field.slug] ||
                    (form[field.slug] instanceof Array && _.isEmpty(form[field.slug])) ||
                    (form[field.slug] instanceof Object && _.isEmpty(form[field.slug]))
                ) {
                    invalidateFields.push(field);
                }
            });

        // Check new properties and clear empty
        Object.keys(form).forEach(key => {
            if (isUpdate && form[key] === this.article[key] && ![ 'id', 'project_id' ].includes(key)) {
                delete form[key];
            }

            if (
                ((_.isString(form[key]) || _.isArray(form[key])) && !form[key].length) ||
                (_.isObject(form[key]) && _.isEmpty(form[key]))
            ) {
                delete form[key];
            }
        });

        if (_.isEmpty(form)) return;

        const submitForm = () => {
            return new Promise(resolve => {
                this.setState({ inProgress: true }, () => {
                    ArticleService[isUpdate ? 'update' : 'create'](form, form.id, this.state.userTypeId)
                        .then(response => {
                            OperatedNotification.success({
                                title: `${isUpdate ? 'Обновление' : 'Создание'} статьи`,
                                message: `Статья успешно ${isUpdate ? 'обновлена' : 'создана'}`,
                                submitButtonText: '← Перейти ко всем статьям',
                                timeOut: 10000,
                                onSubmit: () => EventEmitter.emit(EVENTS.REDIRECT, `/project/${this.state.projectId}`)
                            });
                            this.setState({
                                articleId: response.data.id,
                                inProgress: false
                            }, () => {
                                this.getArticle();
                                resolve();
                            });
                        }).catch(() => this.setState({ inProgress: false }, resolve));
                });
            });
        };

        if (invalidateFields.length) {
            return OperatedNotification.warning({
                title: 'Внимание',
                message: `Не заполнены обязательные поля: \n${invalidateFields.map(({ name }) => name).join(',\n')}`,
                submitButtonText: isUpdate ? 'Обновить' : 'Создать',
                onSubmit: () => submitForm(),
                onCancel: () => {
                }
            });
        }

        return submitForm();
    };

    handleDocumentKeyDown = (event) => {
        const keyCode = event.keyCode || event.which;

        if (event.ctrlKey) {
            switch (keyCode) {
                case KEY_CODE.arrows.right:
                    event.preventDefault();
                    this.handleNextArticle();
                    break;
                case KEY_CODE.arrows.left:
                    event.preventDefault();
                    this.handlePrevArticle();
                    break;
                default:
                    break;
            }
        }
    };

    getArticle = () => {
        const { location } = this.props;
        const { userTypeId, articleId, archiveId } = this.state;
        const searchParams = location.search && new URLSearchParams(location.search);
        const requestForm = {
            expand: 'project.projectFields,project.sections,' +
                'project.users,source,complete_monitor,complete_analytic,complete_client,archive',
            user_type: userTypeId
        };

        if (!userTypeId) return;

        if (searchParams) {
            for (const item of searchParams.entries()) {
                requestForm[item[0]] = item[1];
            }
        }

        this.setState({ inProgress: true }, () => {
            ArchiveService
                .articles
                .get(archiveId, articleId, requestForm)
                .then(response => {
                    const newState = { ...this.state };
                    const form = response.data;
                    const sections = form.project.sections;
                    const articlesNavs = {
                        current: _.get(response.headers, 'x-current'),
                        next: _.get(response.headers, 'x-next-article'),
                        prev: _.get(response.headers, 'x-prev-article'),
                        total: _.get(response.headers, 'x-total-count')
                    };

                    form.date = toDateWithoutTimeZone(form.date);
                    form.createdAt = toDateWithoutTimeZone(form.createdAt);
                    form.updatedAt = toDateWithoutTimeZone(form.updatedAt);
                    form.authors = (form.authors || []).map(({ id, name }) => ({ label: name, value: id }));

                    if (form.source && form.source.id) {
                        form.source = { name: form.source.name, value: form.source.id };
                    }

                    [ 'section_main_id', 'section_sub_id', 'section_three_id' ].forEach(option => {
                        if (form[option]) {
                            const found = this.findSectionById(form[option], sections);

                            if (found) {
                                // form[option] = {name: found.name, value: found.id, ...found};
                                newState[sectionsSet[option]] = found[sectionsSet[option]];
                            }
                        }
                    });

                    this.article = _.cloneDeep(form);
                    const fields = form.project.projectFields.find(f => f.user_type_id === userTypeId);

                    if (fields && fields.data) {
                        fields.data = fields.data.sort((a, b) => a.order - b.order);
                    }

                    if (!this.props.currentProject) {
                        this.props.setCurrentProject(form.project);
                    }
                    
                    newState.articleId = form.id;
                    newState.projectId = form.project.id;
                    newState.articlesNavs = articlesNavs;
                    newState.projectFields = fields ? fields.data : [];
                    newState.sections = sections;
                    newState.form = form;
                    newState.prevForm = _.cloneDeep(form);
                    newState.textIsChanged = false;
                    newState.annotationIsChanged = false;
                    newState.inProgress = false;

                    this.setState(newState, () => {
                        if (!this.props.currentArchive) {
                            this.getArchive();
                        }
                    });
                    this.props.setCurrentArticle(this.article);
                })
                .catch(() => this.setState({ inProgress: false }));
        });
    };

    getArchive = () => {
        const { projectId, archiveId } = this.state;

        ArchiveService
            .get(projectId, archiveId)
            .then(response => {
                this.setState({ archive: response.data, inProgress: false });
                this.props.setCurrentArchive(response.data);
            });
    };

    getDataSectionFields = () => {
        const { form, sectionsTwo, sectionsThree, projectFields } = this.state;
        const clonedFields = projectFields && projectFields.length ? _.cloneDeep(projectFields) : [];

        let dataSectionFields = clonedFields.filter(({ slug }) => {
            return !this.unSortableFields.includes(slug);
        });

        if (!form.section_main_id || !sectionsTwo || !sectionsTwo.length) {
            dataSectionFields = dataSectionFields.filter(({ slug }) => slug !== 'section_sub_id');
        }

        if (!form.section_sub_id || !sectionsThree || !sectionsThree.length) {
            dataSectionFields = dataSectionFields.filter(({ slug }) => slug !== 'section_three_id');
        }

        return dataSectionFields
            .filter(({ slug }) => slug !== 'user_id')
            .sort((a, b) => a.order - b.order);
    };

    setUserType = () => {
        const storageValue = StorageService.get(STORAGE_KEY.USER_TYPE);
        const userType = storageValue && JSON.parse(storageValue);

        if (!userType) return;

        this.setState({ userTypeId: userType.id, userType });
    };

    findSectionById = (sectionId, sections) => {
        const r = (items) => {
            let found = null;

            for (const item of items) {
                if (item.id === sectionId) {
                    found = item;
                    break; // for stop loop
                }

                if (item.sectionsTwo && item.sectionsTwo.length) {
                    found = r(item.sectionsTwo);
                }

                if (item.sectionsThree && item.sectionsThree.length) {
                    found = r(item.sectionsThree);
                }

                if (found) {
                    break;
                }
            }

            return found;
        };

        return r(sections);
    };

    saveFieldsSort = () => {
        const { projectFields, userTypeId, roles } = this.state;
        const readOnly = !isProjectAccess([ PROJECT_PERMISSION.EDIT ]) && !isRolesAccess(roles.admin);

        if (readOnly) return;

        ProjectService.cancelLast();
        ProjectService.put(this.state.projectId, {
            projectFields: [ {
                data: projectFields,
                user_type_id: userTypeId
            } ]
        });
    };

    articleId = this.props.match.params.articleId;

    unSortableFields = [ 'annotation', 'text', 'complete_monitor', 'complete_analytic', 'complete_client' ];

    article = null;

    renderField = (field) => {
        const { roles } = this.props;
        const { form, sections, sectionsTwo, sectionsThree } = this.state;
        const getValue = (prop) => _.isObject(prop) ? prop.value : prop;

        field.readOnly = !isProjectAccess([ PROJECT_PERMISSION.EDIT ]) && !isRolesAccess(roles.admin);

        switch (field.slug) {
            case 'source_id':
                field.requestService = SourceService.get;
                field.requestCancelService = SourceService.cancelLast;
                break;
            case 'source_type_id':
                field.requestService = SourceService.type.get;
                field.requestCancelService = SourceService.cancelLast;
                break;
            case 'section_main_id':
                field.options = sections.map(section => ({
                    label: section.name,
                    value: section.id,
                    sectionsTwo: section.sectionsTwo
                }));
                break;
            case 'section_sub_id':
                field.options = sectionsTwo.map(section => ({
                    label: section.name,
                    value: section.id,
                    sectionsThree: section.sectionsThree
                }));
                break;
            case 'section_three_id':
                field.options = sectionsThree.map(({ name, id }) => ({ label: name, value: id }));
                break;
            case 'genre_id':
                field.requestService = ArticleService.genre;
                field.requestCancelService = ArticleService.cancelLast;
                break;
            case 'type_id':
                field.requestService = ArticleService.types;
                field.requestCancelService = ArticleService.cancelLast;
                break;
            case 'heading_id':
                field.requestService = ArticleService.heading;
                field.requestCancelService = ArticleService.cancelLast;
                break;
            case 'rating_id':
                field.requestService = ArticleService.rating;
                field.requestCancelService = ArticleService.cancelLast;
                break;
            case 'country_id':
                field.requestService = LocationService.country.get;
                field.requestCancelService = LocationService.cancelLast;
                break;
            case 'federal_district_id':
                field.requestService = LocationService.federal.get;
                field.requestCancelService = LocationService.cancelLast;
                field.depended = [ {
                    name: 'query[country_id]',
                    value: getValue(form.country_id)
                } ];
                break;
            case 'region_id':
                field.requestService = LocationService.region.get;
                field.requestCancelService = LocationService.cancelLast;
                field.depended = [ {
                    name: 'query[federal_district_id]',
                    value: getValue(form.federal_district_id)
                }, {
                    name: 'query[country_id]',
                    value: getValue(form.country_id)
                } ];
                break;
            case 'city_id':
                field.requestService = LocationService.city.get;
                field.requestCancelService = LocationService.cancelLast;
                field.depended = [ {
                    name: 'query[region_id]',
                    value: getValue(form.region_id)
                } ];
                break;
            case 'authors':
                field.options = form.authors;
                field.requestService = ArticleService.author;
                field.requestCancelService = ArticleService.cancelLast;
                break;
            case 'createdAt':
            case 'updatedAt':
                // Из-за ленятев в бэкенде
                field.readOnly = true;
                break;
            default:
                break;
        }

        return (
            <ProjectCreateField
                key={field.slug}
                field={field}
                placeholder={field.name}
                value={form[field.slug] || ''}
                onChange={this.handleChangeForm}
            />
        );
    };

    render() {
        const { roles } = this.props;
        const {
            articlesNavs,
            form,
            showViewSettings,
            showLocationModal,
            viewType,
            projectFields,
            inProgress
        } = this.state;
        const isUpdate = !!this.state.articleId;
        const dataSectionFields = this.getDataSectionFields();
        const readOnly = !isProjectAccess([ PROJECT_PERMISSION.EDIT ]) && !isRolesAccess(roles.admin);
        const sectionData = (
            <Sortable
                {...cls('section', 'sortable')}
                options={{
                    disabled: isMobileScreen() || (!_.isEmpty(roles) && readOnly),
                    animation: 150,
                    handle: '.drag-handle'
                }}
                onChange={this.handleEndSort}
            >
                {dataSectionFields.map(this.renderField)}
            </Sortable>
        );

        const sectionAnnotation = projectFields.find(({ slug }) => slug === 'annotation') ? (
            <section {...cls('section')}>
                <TinyMCE
                    {...cls('field', 'annotation')}
                    readOnly={readOnly}
                    label='Аннотация'
                    content={form.annotation || ''}
                    onEditorChange={value => this.handleChangeForm(value, 'annotation')}
                    onChange={() => this.setState({ annotationIsChanged: true })}
                />
                {/* <RichEditor
                    {...cls('field', 'annotation')}
                    label='Аннотация'
                    readOnly={readOnly}
                    content={form.annotation || ''}
                    onChange={value => this.handleChangeForm(value, 'annotation')}
                /> */}
            </section>
        ) : null;

        const sectionText = projectFields.find(({ slug }) => slug === 'text') ? (
            <section {...cls('section')}>
                <TinyMCE
                    {...cls('field', 'textarea')}
                    readOnly={readOnly}
                    label='Текст статьи'
                    content={form.text || ''}
                    onEditorChange={value => this.handleChangeForm(value, 'text')}
                    onChange={() => this.setState({ textIsChanged: true })}
                />
                {/* <RichEditor
                    {...cls('field', 'textarea')}
                    readOnly={readOnly}
                    label='Текст статьи'
                    content={form.text || ''}
                    onChange={value => this.handleChangeForm(value, 'text')}
                /> */}
            </section>
        ) : null;

        return (
            <Page withBar staticBar {...cls()}>
                <Breadcrumbs location={this.props.location} />
                <section {...cls('header')}>
                    <a
                        {...cls('back-button')}
                        onClick={this.handleClickBackButton}
                    ><i>‹</i> Назад к архиву</a>

                    <div {...cls('title-wrap')}>
                        {articlesNavs.prev && (
                            <button
                                {...cls('title-button', 'left')}
                                onClick={this.handlePrevArticle}
                            ><ArrowIcon {...cls('title-arrow')}/></button>
                        )}

                        <h2 {...cls('title')}>
                            {isUpdate ? 'Статья' : 'Новая статья'}
                            {(articlesNavs.current && articlesNavs.total) &&
                            ` ${articlesNavs.current} из ${articlesNavs.total}`}
                        </h2>

                        {articlesNavs.next && (
                            <button
                                {...cls('title-button', 'right')}
                                onClick={this.handleNextArticle}
                            ><ArrowIcon {...cls('title-arrow')}/></button>
                        )}
                    </div>

                    {/*
                    <button
                        {...cls('view-button')}
                        onClick={this.handleShowViewSettings}
                        title='Отображение статей'
                    >
                        <div {...cls('view-button-icon')}>
                            <i/><i/><i/>
                        </div>

                    </button>

                    <button
                        {...cls('location-button')}
                        title='Добавить город'
                        onClick={() => this.setState({ showLocationModal: true })}
                    >
                        <LocationIcon/>
                    </button>

                    <Access permissions={[ PROJECT_PERMISSION.EDIT ]}>
                        <Button
                            {...cls('done-button')}
                            text={userType && form[`complete_${userType.slug}`] ? 'Отменить завершение' : 'Завершить статью'}
                            style={userType && form[`complete_${userType.slug}`] ? 'info' : 'success'}
                            disabled={!userType}
                            onClick={this.handleDoneArticle}
                        />

                        <Button
                            {...cls('submit-button')}
                            text={isUpdate ? 'Обновить' : 'Создать'}
                            onClick={() => this.form.submit()}
                        />
                    </Access>
                    */}
                </section>

                <Form
                    {...cls('form', '', 'container')}
                    onSubmit={this.handleSubmit}
                    ref={node => this.form = node}
                >
                    {viewType === 1 && (
                        <div {...cls('row', '', 'row')}>
                            <div {...cls('col', '', 'col-lg-6')}>
                                {sectionData}
                            </div>

                            <div {...cls('col', '', 'col-lg-6')}>
                                {sectionAnnotation}
                                {sectionText}
                            </div>
                        </div>
                    )}

                    {viewType === 2 && (
                        <div {...cls('row', '', 'row')}>
                            <div {...cls('col', '', 'col-lg-6')}>
                                {sectionAnnotation}
                                {sectionText}
                            </div>

                            <div {...cls('col', '', 'col-lg-6')}>
                                {sectionData}
                            </div>
                        </div>
                    )}

                    {viewType === 3 && (
                        <div {...cls('row', '', 'row')}>
                            <div {...cls('col', '', 'col-lg-6')}>
                                {sectionText}
                            </div>

                            <div {...cls('col', '', 'col-lg-6')}>
                                {sectionData}
                                {sectionAnnotation}
                            </div>
                        </div>
                    )}

                    {viewType === 4 && (
                        <div {...cls('row', '', 'row')}>
                            <div {...cls('col', '', 'col-xs-12')}>
                                {sectionData}
                                {sectionAnnotation}
                                {sectionText}
                            </div>
                        </div>
                    )}
                </Form>

                {showViewSettings && (
                    <ArticleViewSettings
                        onClose={() => this.setState({ showViewSettings: false })}
                        onChange={this.handleChangeViewType}
                    />
                )}

                {showLocationModal && (
                    <CreateLocationModal
                        onClose={() => this.setState({ showLocationModal: false })}
                    />
                )}

                {inProgress && <Loader/>}
            </Page>
        );
    }
}

function mapStateToProps(state) {
    const roles = {};

    state.roles.forEach(({ name }) => roles[name] = name);

    return {
        userTypes: state.userTypes,
        currentProject: state.currentProject,
        profile: state.profile,
        roles
    };
}

function mapDispatchToProps(dispatch) {
    return {
        setCurrentArticle: (value) => dispatch(setCurrentArticle(value)),
        clearCurrentArticle: () => dispatch(clearCurrentArticle()),
        setCurrentProject: (value) => dispatch(setCurrentProject(value)),
        setCurrentArchive: (value) => dispatch(setCurrentArchive(value))
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ArchiveArticlePage);
