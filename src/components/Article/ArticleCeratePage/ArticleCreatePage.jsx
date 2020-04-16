import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Page from '../../Shared/Page/Page';
import {ArticleService, LocationService, ProjectService, SourceService, StorageService} from '../../../services';
import './article-create-page.scss';
import Form from '../../Form/Form/Form';
import RichEditor from '../../Form/RichEditor/RichEditor';
import Loader from '../../Shared/Loader/Loader';
import ArrowIcon from '../../Shared/SvgIcons/ArrowIcon';
import Button from '../../Shared/Button/Button';
import ArticleViewSettings from './ArticleViewSettings/ArticleViewSettings';
import ProjectCreateField from '../../Project/ProjectCreatePage/ProjectCreatePageField/ProjectCreatePageField';
import Sortable from 'react-sortablejs';
import {isMobileScreen, isProjectAccess, isRolesAccess, OperatedNotification} from '../../../helpers/Tools';
import {STORAGE_KEY} from '../../../constants';
import {EventEmitter} from "../../../helpers";
import {EVENTS} from "../../../constants";
import store from "../../../redux/store";
import {setCurrentProject} from "../../../redux/actions/currentProject";
import {PROJECT_PERMISSION} from "../../../constants/ProjectPermissions";
import Access from "../../Shared/Access/Access";
import {KEY_CODE} from "../../../constants";
import TinyMCE from "../../Form/TinyMCE/TinyMCE";

const cls = new Bem('article-create-page');
const sectionsSet = {
    'section_main_id': 'sectionsTwo',
    'section_sub_id': 'sectionsThree'
};

class ArticleCreatePage extends Component {
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

        this.articleId = props.match.params.articleId;
        this.projectId = props.match.params.projectId;
        this.defaultForm = {
            title: '',
            source_id: null,
            date: new Date(),
            media: '',
            url: '',
            projectId: this.projectId,
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
            articlesNavs: {},
            projectFields: [],
            sources: [],
            prevForm: _.clone(this.defaultForm),
            form: _.clone(this.defaultForm),
            selectedMedia: {},
            viewType: StorageService.get(STORAGE_KEY.ARTICLE_VIEW_TYPE) || 1,
            userTypeId: userType ? userType.id : null,
            userType: null,
            showViewSettings: false,
            inProgress: true
        };
    }

    componentDidMount() {
        this.setUserType();
        EventEmitter.on(EVENTS.USER.CHANGE_TYPE, this.setUserType);
        document.addEventListener('keydown', this.handleDocumentKeyDown);

        if (this.articleId) {
            StorageService.set(STORAGE_KEY.LAST_VIEWED_ARTICLE, this.articleId);
            this.getArticle();
        } else {
            ProjectService
                .get({expand: 'projectFields,sections,users'}, this.projectId)
                .then(response => {
                    const {userTypeId} = this.state;
                    const project = response.data;

                    if (!this.props.currentProject) {
                        store.dispatch(setCurrentProject(project));
                    }

                    if (project && project.projectFields) {
                        const projectFields = project.projectFields.find(f => f.user_type_id === userTypeId);

                        this.setState({
                            sections: project.sections,
                            projectFields: projectFields && projectFields.data,
                            inProgress: false
                        }); // , this.getAdditionalDataFields
                    }
                })
                .catch(() => this.setState({inProgress: false}));
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.match.params.articleId !== this.props.match.params.articleId) {
            this.articleId = this.props.match.params.articleId;
            this.getArticle();
        }
        if (!_.isEqual(prevProps.userTypes, this.props.userTypes)) {
            this.setUserType();
        }
    }

    componentWillUnmount() {
        EventEmitter.off(EVENTS.USER.CHANGE_TYPE, this.setUserType);
        document.removeEventListener('keydown', this.handleDocumentKeyDown);
    }

    handleChangeForm = (value, option) => {
        const newState = this.state;

        newState.form[option] = _.get(value, 'value', value); // if object and has "value"

        if (option === 'section_main_id') {
            newState.sectionsTwo = value.sectionsTwo;
            newState.sectionsThree = [];
            newState.form.section_sub_id = null;
            newState.form.section_three_id = null;
        }

        if (option === 'section_sub_id') {
            newState.sectionsThree = value.sectionsThree;
            newState.form.section_three_id = null;
        }

        this.setState(newState);
    };

    handleShowViewSettings = () => {
        this.setState({showViewSettings: true});
    };

    handleChangeViewType = (key) => {
        this.setState({viewType: key});
    };

    handlePrevArticle = () => {
        const {location} = this.props;
        const {articlesNavs} = this.state;
        const sp = new URLSearchParams(location.search);

        if (!articlesNavs.prev) return;

        this.checkFormChanges().then(() => {
            EventEmitter.emit(
                EVENTS.REDIRECT,
                `/project/${this.projectId}/article/${articlesNavs.prev}?page=${sp.get('page')}`
            );
        });
    };

    handleNextArticle = () => {
        const {location} = this.props;
        const {articlesNavs} = this.state;
        const sp = new URLSearchParams(location.search);

        if (!articlesNavs.next) return;

        this.checkFormChanges().then(() => {
            EventEmitter.emit(
                EVENTS.REDIRECT,
                `/project/${this.projectId}/article/${articlesNavs.next}?page=${sp.get('page')}`
            );
        });
    };

    handleClickBackButton = () => {
        const {location} = this.props;
        const sp = new URLSearchParams(location.search);

        this.checkFormChanges().then(() => {
            EventEmitter.emit(EVENTS.REDIRECT, `/project/${this.projectId}?page=${sp.get('page')}`);
        });
    };

    handleEndSort = (sortedKeys) => {
        const {projectFields} = this.state;

        sortedKeys.push(...this.unSortableFields);
        const sortedList = sortedKeys.map((key, index) => {
            const item = projectFields.find(({slug}) => slug === key);

            if (item) item.order = index;

            return item;
        }).filter(item => !!item);

        sortedList.push(
            ...this.unSortableFields.map(key => projectFields.find(({slug}) => slug === key))
        );

        this.setState({projectFields: sortedList}, this.saveFieldsSort);
    };

    handleDoneArticle = () => {
        const { userType } = this.state;

        if (userType) {
            this.setState(state => {
                state.form[`complete_${userType.slug}`] = !state.form[`complete_${userType.slug}`];
                return state;
            }, this.handleSubmit);
        }
    };

    handleSubmit = () => {
        const form = _.cloneDeep(this.state.form);
        const isUpdate = !!this.articleId;
        const invalidateFields = [];

        form.date = moment(form.date).format();
        form.project_id = this.projectId;

        // При обновлении статьи сбрасываем ее готовность
        // if (resetComplete && userType) {
        //     form[`complete_${userType.slug}`] = false;
        // }

        if (form.authors && form.authors.length) {
            form.authors = form.authors.map(({label, value}) => ({id: value, name: label}));
        }

        delete form.project;
        delete form.source;

        form.text = form.text.replace(/\r\n|\r|\n/g, '');
        form.annotation = form.annotation.replace(/\r\n|\r|\n/g, '');

        ['section_main_id', 'section_sub_id', 'section_three_id']
            .forEach(option => {
                if (form[option] && form[option].value) {
                    form[option] = form[option].value;
                }
            });

        // Check required
        this.state.projectFields
            .filter(({required}) => required)
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
            if (isUpdate && form[key] === this.article[key] && !['id', 'project_id'].includes(key)) {
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
                this.setState({inProgress: true}, () => {
                    ArticleService[isUpdate ? 'update' : 'create'](form, form.id, this.state.userTypeId)
                        .then(response => {
                            OperatedNotification.success({
                                title: `${isUpdate ? 'Обновление' : 'Создание'} статьи`,
                                message: `Статья успешно ${isUpdate ? 'обновлена' : 'создана'}`,
                                submitButtonText: '← Перейти ко всем статьям',
                                timeOut: 10000,
                                onSubmit: () => EventEmitter.emit(EVENTS.REDIRECT, `/project/${this.projectId}`)
                            });
                            this.articleId = response.data.id;
                            this.setState({inProgress: false}, () => {
                                this.getArticle();
                                resolve();
                            });
                        }).catch(() => this.setState({inProgress: false}, resolve));
                });
            });
        };

        if (invalidateFields.length) {
            return OperatedNotification.warning({
                title: 'Внимание',
                message: `Не заполнены обязательные поля: \n${invalidateFields.map(({name}) => name).join(',\n')}`,
                submitButtonText: isUpdate ? 'Обновить' : 'Создать',
                onSubmit: () => submitForm(),
                onCancel: () => {}
            });
        }

        return submitForm();
    };

    handleDocumentKeyDown = (event) => {
        const keyCode = event.keyCode || event.which;

        if (event.ctrlKey) {
            switch (keyCode) {
                case KEY_CODE.arrows.right:
                    this.handleNextArticle();
                    break;
                case KEY_CODE.arrows.left:
                    this.handlePrevArticle();
                    break;
                case KEY_CODE.chars.s:
                    event.preventDefault();
                    this.handleSubmit();
                    break;
                default:
                    break;
            }
        }
    };

    getArticle = () => {
        const {location} = this.props;
        const {userTypeId} = this.state;
        const searchParams = location.search && new URLSearchParams(location.search);
        const requestForm = {
            expand: 'project.projectFields,project.sections,' +
                'project.users,source,complete_monitor,complete_analytic,complete_client',
            user_type: userTypeId
        };

        if (!userTypeId) return;

        if (searchParams) {
            for (const item of searchParams.entries()) {
                requestForm[item[0]] = item[1];
            }
        }

        this.setState({inProgress: true}, () => {
            ArticleService
                .get(this.articleId, requestForm)
                .then(response => {
                    const newState = this.state;
                    const form = response.data;
                    const sections = form.project.sections;
                    const articlesNavs = {
                        current: _.get(response.headers, 'x-current'),
                        next: _.get(response.headers, 'x-next-article'),
                        prev: _.get(response.headers, 'x-prev-article'),
                        total: _.get(response.headers, 'x-total-count')
                    };

                    form.date = new Date(form.date);
                    form.authors = (form.authors || []).map(({id, name}) => ({label: name, value: id}));

                    if (form.source && form.source.id) {
                        form.source = {name: form.source.name, value: form.source.id};
                    }

                    ['section_main_id', 'section_sub_id', 'section_three_id'].forEach(option => {
                        if (form[option]) {
                            const found = this.findSectionById(form[option], sections);

                            if (found) {
                                form[option] = {name: found.name, value: found.id, ...found};
                                newState[sectionsSet[option]] = found[sectionsSet[option]];
                            }
                        }
                    });

                    this.article = _.cloneDeep(form);
                    const fields = form.project.projectFields.find(f => f.user_type_id === userTypeId);

                    if (!this.props.currentProject) {
                        store.dispatch(setCurrentProject(form.project));
                    }

                    newState.articlesNavs = articlesNavs;
                    newState.projectFields = fields ? fields.data : [];
                    newState.sections = sections;
                    newState.form = form;
                    newState.prevForm = _.cloneDeep(form);
                    newState.inProgress = false;

                    this.setState(newState);
                })
                .catch(() => this.setState({inProgress: false}));
        });
    };

    getDataSectionFields = () => {
        const {form, sectionsTwo, sectionsThree, projectFields} = this.state;
        const clonedFields = projectFields && projectFields.length ? _.cloneDeep(projectFields) : [];

        let dataSectionFields = clonedFields.filter(({slug}) => {
            return !this.unSortableFields.includes(slug);
        });

        if (!form.section_main_id || !sectionsTwo || !sectionsTwo.length) {
            dataSectionFields = dataSectionFields.filter(({slug}) => slug !== 'section_sub_id');
        }

        if (!form.section_sub_id || !sectionsThree || !sectionsThree.length) {
            dataSectionFields = dataSectionFields.filter(({slug}) => slug !== 'section_three_id');
        }

        return dataSectionFields;
    };

    setUserType = () => {
        const storageValue = StorageService.get(STORAGE_KEY.USER_TYPE);
        const userType = storageValue && JSON.parse(storageValue);

        this.setState({userTypeId: userType.id, userType}, () => {
            if (this.articleId) {
                this.getArticle();
            }
        });
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
        const {projectFields, userTypeId, roles} = this.state;
        const readOnly = !isProjectAccess([PROJECT_PERMISSION.EDIT]) && !isRolesAccess(roles.admin);

        if (readOnly) return;

        ProjectService.cancelLast();
        ProjectService.put(this.projectId, {
            data: projectFields,
            user_type_id: userTypeId
        });
    };

    checkFormChanges = () => {
        const {prevForm, form} = this.state;

        return new Promise((resolve) => {
            const prevFormClone = _.cloneDeep(prevForm);
            const formClone = _.cloneDeep(form);

            let isEqual = true;

            delete prevFormClone.project;
            delete formClone.project;

            prevFormClone.text = this.clearString(prevFormClone.text);
            formClone.text = this.clearString(formClone.text);

            prevFormClone.section_main_id = _.get(prevFormClone.section_main_id, 'value');
            formClone.section_main_id = _.get(formClone.section_main_id, 'value');

            prevFormClone.source = _.get(prevFormClone.source, 'value');
            formClone.source = _.get(formClone.source, 'value');

            if (prevFormClone.date) {
                prevFormClone.date = prevFormClone.date.toString();
                formClone.date = formClone.date.toString();
            }

            Object.keys(prevFormClone).forEach(key => {
                if (!_.isEqual(prevFormClone[key],  formClone[key])) {
                    isEqual = false;
                }
            });

            if (!isEqual) {
                return OperatedNotification.warning({
                    title: 'Внимание',
                    message: 'Есть несохраненные изменения.\nПродолжить без сохранения?',
                    submitButtonText: 'Продолжить',
                    cancelButtonText: 'Сохранять',
                    closeOnClick: true,
                    onSubmit: () => resolve(),
                    onCancel: () => this.handleSubmit()
                });
            }

            return resolve();
        });
    };

    clearString = (value) => {
        let newValue = value;

        if (!_.isString(newValue)) {
            newValue = '';
        }

        return newValue.replace(/<[^>]*>?/gm, '');
    };

    articleId = this.props.match.params.articleId;

    unSortableFields = ['annotation', 'text', 'complete_monitor', 'complete_analytic', 'complete_client'];

    article = null;

    render() {
        const {roles} = this.props;
        const {
            articlesNavs,
            form,
            showViewSettings,
            sections,
            sectionsTwo,
            sectionsThree,
            viewType,
            projectFields,
            userType,
            inProgress
        } = this.state;
        const isUpdate = !!this.articleId;
        const dataSectionFields = this.getDataSectionFields();
        const getValue = (prop) => _.isObject(prop) ? prop.value : prop;
        const readOnly = !isProjectAccess([PROJECT_PERMISSION.EDIT]) && !isRolesAccess(roles.admin);
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
                {dataSectionFields.map(field => {
                    field.readOnly = readOnly;

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
                                name: section.name,
                                value: section.id,
                                sectionsTwo: section.sectionsTwo
                            }));
                            break;
                        case 'section_sub_id':
                            field.options = sectionsTwo.map(section => ({
                                name: section.name,
                                value: section.id,
                                sectionsThree: section.sectionsThree
                            }));
                            break;
                        case 'section_three_id':
                            field.options = sectionsThree.map(({name, id}) => ({name, value: id}));
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
                            field.depended = [{
                                name: 'query[country_id]',
                                value: getValue(form.country_id)
                            }];
                            break;
                        case 'region_id':
                            field.requestService = LocationService.region.get;
                            field.requestCancelService = LocationService.cancelLast;
                            field.depended = [{
                                name: 'query[federal_district_id]',
                                value: getValue(form.federal_district_id)
                            }, {
                                name: 'query[country_id]',
                                value: getValue(form.country_id)
                            }];
                            break;
                        case 'city_id':
                            field.requestService = LocationService.city.get;
                            field.requestCancelService = LocationService.cancelLast;
                            field.depended = [{
                                name: 'query[region_id]',
                                value: getValue(form.region_id)
                            }];
                            break;
                        case 'authors':
                            field.options = form.authors;
                            field.requestService = ArticleService.author;
                            field.requestCancelService = ArticleService.cancelLast;
                            break;
                        default:
                            field.options = [];
                    }

                    return (
                        <ProjectCreateField
                            key={field.slug}
                            field={field}
                            placeholder={field.placeholder}
                            value={form[field.slug] || ''}
                            onChange={this.handleChangeForm}
                        />
                    );
                })}
            </Sortable>
        );

        const sectionAnnotation = projectFields.find(({slug}) => slug === 'annotation') ? (
            <section {...cls('section')}>
                <RichEditor
                    {...cls('field', 'annotation')}
                    label='Аннотация'
                    readOnly={readOnly}
                    content={form.annotation || ''}
                    onChange={value => this.handleChangeForm(value, 'annotation')}
                />
            </section>
        ) : null;

        const sectionText = projectFields.find(({slug}) => slug === 'text') ? (
            <section {...cls('section')}>
                <TinyMCE
                    {...cls('field', 'textarea')}
                    readOnly={readOnly}
                    label='Текст статьи'
                    content={form.text || ''}
                    onChange={value => this.handleChangeForm(value, 'text')}
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
                <section {...cls('header')}>
                    <a
                        {...cls('back-button')}
                        onClick={this.handleClickBackButton}
                    ><i>‹</i> Назад к проекту</a>

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

                    <button
                        {...cls('view-button')}
                        onClick={this.handleShowViewSettings}
                        title='Отображение статей'
                    >
                        <div {...cls('view-button-icon')}>
                            <i/><i/><i/>
                        </div>

                        {/* <span>Отображение статей</span> */}
                    </button>

                    <Access permissions={[PROJECT_PERMISSION.EDIT]}>
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
                        onClose={() => this.setState({showViewSettings: false})}
                        onChange={this.handleChangeViewType}
                    />
                )}

                {inProgress && <Loader/>}
            </Page>
        );
    }
}

function mapStateToProps(state) {
    const roles = {};

    state.roles.forEach(({name}) => roles[name] = name);

    return {
        userTypes: state.userTypes,
        currentProject: state.currentProject,
        roles
    };
}

export default connect(mapStateToProps)(ArticleCreatePage);
