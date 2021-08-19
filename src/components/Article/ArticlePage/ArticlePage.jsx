import React, { Component } from 'react';

import PropTypes from 'prop-types';

import { connect } from 'react-redux';

import { ArticleService, LocationService, ProjectService, SourceService, StorageService } from '@services';

import Sortable from 'react-sortablejs';

import { isMobileScreen, isProjectAccess, isRolesAccess, OperatedNotification } from '@helpers/Tools';
import { EventEmitter } from "@helpers";

import { STORAGE_KEY } from '@const';
import { EVENTS } from "@const";

import store from "@redux/store";
import { setCurrentProject } from "@redux/actions/currentProject";
import { PROJECT_PERMISSION } from "@const/ProjectPermissions";
import { KEY_CODE } from "@const";

import CreateLocationModal from "./CreateLocationModal";
import { setCurrentArticle, clearCurrentArticle, setAppProgress } from '../../../redux/actions';

import ArticleViewSettings from './ArticleViewSettings';
import ProjectCreateField from '../../Project/ProjectCreatePage/ProjectCreatePageField';
import Form from '../../Form/Form';
import Page from '../../Shared/Page/Page';
import Breadcrumbs from '../../Shared/Breadcrumbs';
import Drawer from '../../Shared/Drawer/Drawer';
import Reprints from '../Reprints/Reprints';
import ArticlePageHeader from './ArticlePageHeader';
import TinyMCE from "@components/Form/TinyMCE/TinyMCE";

import './article-page.scss';
import { NotificationManager } from 'react-notifications';

const cls = new Bem('article-page');
const defaultTimeZone = 'Europe/Moscow';
const toDateWithoutTimeZone = (date) => {
    if (!date) return new Date();
    const removeTimeZone = moment(date).format('YYYY-MM-DDTHH:mm:ss');

    return new Date(removeTimeZone);
};
const sectionsSet = {
    'section_main_id': 'sectionsTwo',
    'section_sub_id': 'sectionsThree'
};

class ArticlePage extends Component {
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

        const projectId = props.match.params.projectId;

        this.defaultForm = {
            title: '',
            source_id: null,
            date: new Date(),
            media: '',
            url: '',
            projectId,
            section_main_id: null,
            section_sub_id: null,
            section_three_id: null,
            authors: [],
            number: '',
            annotation: '',
            text: ''
        };

        this.state = {
            articleId: props.match.params.articleId,
            projectId,
            articlesNavs: {},
            projectFields: [],
            sources: [],
            prevForm: _.clone(this.defaultForm),
            form: _.clone(this.defaultForm),
            selectedMedia: {},
            viewType: StorageService.get(STORAGE_KEY.ARTICLE_VIEW_TYPE) || 1,
            showDrawer: false,
            showViewSettings: false,
            textIsChanged: false,
            annotationIsChanged: false,
            timeZone: defaultTimeZone,
            loadedSources: [],
            loadedCities: [],
            sectionsTwo: [],
            sectionsThree: []
        };
    }

    componentDidMount() {
        document.addEventListener('keydown', this.handleDocumentKeyDown);

        this.props.onSetAppProgress({
            inProgress: true,
            withBlockedOverlay: true
        });

        if (this.state.articleId) {
            StorageService.set(STORAGE_KEY.LAST_VIEWED_ARTICLE, this.state.articleId);

            if (this.props.userType) {
                this.getArticle();
            }
        } else {
            ProjectService
                .get({ expand: 'projectFields,sections,users' }, this.state.projectId)
                .then(response => {
                    const { userType } = this.props;
                    const project = response.data;

                    if (!this.props.currentProject) {
                        store.dispatch(setCurrentProject(project));
                    }

                    if (project && project.projectFields) {
                        const projectFields = project.projectFields.find(f => f.user_type_id === userType.id);

                        if (projectFields && projectFields.data) {
                            projectFields.data = projectFields.data.sort((a, b) => a.order - b.order);
                        }

                        this.setState({
                            sections: project.sections,
                            projectFields: projectFields && projectFields.data
                        }); // , this.getAdditionalDataFields
                    }
                })
                .finally(() => {
                    this.props.onSetAppProgress({
                        inProgress: false,
                        withBlockedOverlay: false
                    });
                });
        }

        if (this.props.profile) {
            this.setState({ timeZone: this.props.profile.timeZone });
        }

        SourceService.get().then(({ data }) => {
            const sources = data.map(el => {
                return {
                    label: el.name,
                    value: el.id
                };
            });
            this.setState({ loadedSources: sources});
        });

        LocationService.city.get().then(({ data }) => {
            const cities = data.map(el => {
                return {
                    label: el.name,
                    value: el.id
                };
            });
            this.setState({ loadedCities: cities});
        });
    }

    componentDidUpdate(prevProps) {
        if (prevProps.match.params.articleId !== this.props.match.params.articleId) {
            this.setState({ articleId: this.props.match.params.articleId }, this.getArticle);
        }

        if (prevProps.userType.id !== this.props.userType.id) {
            this.getArticle();
        }

        if (prevProps.profile !== this.props.profile) {
            this.setState({ timeZone: this.props.profile.timeZone });
        }
    }

    componentWillUnmount() {
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

    handleShowDrawer = () => {
        this.setState({ showDrawer: true });
    };

    handleCloseDrawer = () => {
        this.setState({ showDrawer: false });
    };

    handleChangeReprints = ({ index, name, value }) => {
        const reprints = this.state.form.reprints;
        reprints[index][name] = value;
        this.handleChangeForm(reprints, 'reprints');
    }

    handleAddReprint = () => {
        const newReprints = [
            ...this.state.form.reprints,
            {
                title: '',
                url: '',
                date: new Date()
            }
        ];
        this.handleChangeForm(newReprints, 'reprints');
    }

    handleDeleteReprint = (index) => {
        const reprints = this.state.form.reprints;
        reprints.splice(index, 1);
        this.handleChangeForm(reprints, 'reprints');
    }

    handleDeleteReprints = (deletableReprints) => {
        const reprints = this.state.form.reprints;
        deletableReprints.forEach(delRep => {
            const index = reprints.findIndex(rep => rep.id === delRep);
            reprints.splice(index, 1);
        });
        this.handleChangeForm(reprints, 'reprints');
    }

    handleCreateArticleFromReprint = ({ title, url, sourceId, cityId, date, index }) => {
        const { userType } = this.props;
        const form = {
            projectId: this.state.projectId,
            title,
            url,
            date,
            source_id: sourceId,
            city_id: cityId
        };

        ArticleService.create(
            { ...form, projectId: this.state.projectId },
            null,
            userType.id
        )
            .then(({data}) => {
                this.handleDeleteReprint(index);
                this.handleSaveReprintsOnly();
                OperatedNotification.success({
                    title: 'Создание статьи',
                    message: 'Статья из перепечатки успешно создана',
                    submitButtonText: '↗ Перейти к статье',
                    timeOut: 10000,
                    onSubmit: () => window.open(`/project/${this.state.projectId}/article/${data.id}`, '_blank')
                });
            });
    }

    handleSaveReprintsOnly = () => {
        const { userType } = this.props;
        const form = {};

        form.reprints = this.state.form.reprints;
        ArticleService.update(form, this.state.form.id, userType.id)
            .then(() => {
                ArticleService.get(this.state.articleId, {
                    project: this.state.projectId,
                    archive: '',
                    user_type: userType.id,
                    expand: 'reprints'
                })
                    .then(({data}) => {
                        this.setState({
                            form: {
                                ...this.state.form,
                                reprints: data.reprints
                            }
                        });
                    });
            });
    };

    handleCreateSourceInReprints = ({ value, index  }) => {
        this.createSource(value, (id) => {
            const reprints = this.state.form.reprints;
            reprints[index].source_id = id;
            this.handleChangeForm(reprints, 'reprints');
        });
    };

    handleCreateSourceInArticle = (value) => {
        this.createSource(value, (id) => {
            const article = this.state.form;
            article.source_id = id;
            this.handleChangeForm(id, 'source_id');
        });
    };

    handleShowViewSettings = () => {
        this.setState({ showViewSettings: true });
    };

    handleChangeViewType = (key) => {
        this.setState({ viewType: key });
    };

    handlePrevArticle = () => {
        const { location, history } = this.props;
        const { articlesNavs, projectId } = this.state;
        const sp = new URLSearchParams(location.search);

        if (!articlesNavs.prev) return;

        this.checkFormChanges().then(() => {
            history.push(`/project/${projectId}/article/${articlesNavs.prev}?page=${sp.get('page')}`);
        });
    };

    handleNextArticle = () => {
        const { location, history } = this.props;
        const { articlesNavs, projectId } = this.state;
        const sp = new URLSearchParams(location.search);

        if (!articlesNavs.next) return;

        this.checkFormChanges().then(() => {
            history.push(`/project/${projectId}/article/${articlesNavs.next}?page=${sp.get('page')}`);
        });
    };

    handleClickBackButton = () => {
        const { location } = this.props;
        const sp = new URLSearchParams(location.search);

        this.checkFormChanges().then(() => {
            EventEmitter.emit(EVENTS.REDIRECT, `/project/${this.state.projectId}?page=${sp.get('page')}`);
        });
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

    handleDoneArticle = () => {
        const { userType } = this.props;

        if (userType) {
            this.setState(state => {
                state.form[`complete_${userType.slug}`] = !state.form[`complete_${userType.slug}`];
                return state;
            }, this.handleSubmit);
        }
    };

    handleDeleteArticle = () => {
        const { onSetAppProgress } = this.props;
        const { articleId, projectId, articlesNavs } = this.state;

        onSetAppProgress({ inProgress: true, withBlockedOverlay: true });

        ArticleService.delete({ articleIds: [ articleId ] }, projectId)
            .then(() => {
                NotificationManager.success('Статья была успешно удалена', 'Удаление статьи');

                if (+articlesNavs.current < +articlesNavs.total) {
                    this.handleNextArticle();
                } else if (+articlesNavs.current > 1) {
                    this.handlePrevArticle();
                }
            })
            .finally(() => onSetAppProgress({ inProgress: false }));
    };

    handleSubmit = (withUpdateArticle = true) => {
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
                // debugger;
                if (field.slug === 'section_sub_id' && (!this.state.sectionsTwo || !this.state.sectionsTwo.length)) {
                    return;
                }

                if (field.slug === 'section_three_id' && (!this.state.sectionsThree || !this.state.sectionsThree.length)) {
                    return;
                }

                if (!form[field.slug] ||
                    (_.isArray(form[field.slug]) && _.isEmpty(form[field.slug])) ||
                    (_.isObject(form[field.slug]) && !_.isDate(form[field.slug]) && _.isEmpty(form[field.slug])) ||
                    (_.isDate(form[field.slug]) && !form[field.slug])
                ) {
                    invalidateFields.push(field);
                }
            });

        // Check new properties and clear empty
        Object.keys(form).forEach(key => {
            if (isUpdate && form[key] === this.article[key] && ![ 'id', 'project_id' ].includes(key)) {
                delete form[key];
            }

            // if (
            //     ((_.isString(form[key]) || _.isArray(form[key])) && !form[key].length) ||
            //     (_.isObject(form[key]) && _.isEmpty(form[key]))
            // ) {
            //     delete form[key];
            // }
        });

        if (_.isEmpty(form)) return;

        const submitForm = () => {
            return new Promise(resolve => {
                const { userType } = this.props;
                this.props.onSetAppProgress({
                    inProgress: true,
                    withBlockedOverlay: true
                });

                ArticleService[isUpdate ? 'update' : 'create'](form, form.id, userType.id)
                    .then(response => {
                        OperatedNotification.success({
                            title: `${isUpdate ? 'Обновление' : 'Создание'} статьи`,
                            message: `Статья успешно ${isUpdate ? 'обновлена' : 'создана'}`,
                            submitButtonText: '← Перейти ко всем статьям',
                            timeOut: 4000,
                            onSubmit: () => EventEmitter.emit(EVENTS.REDIRECT, `/project/${this.state.projectId}`)
                        });
                        this.setState({ articleId: response.data.id }, () => {
                            if (withUpdateArticle) {
                                this.getArticle();
                            }
                            resolve();
                        });
                    })
                    .finally(() => {
                        this.props.onSetAppProgress({
                            inProgress: false,
                            withBlockedOverlay: false
                        });
                        resolve();
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
        const { location, userType } = this.props;

        if (!userType.id) return;

        const searchParams = location.search && new URLSearchParams(location.search);
        const requestForm = {
            expand: 'project.projectFields,project.sections,reprints,' +
                'project.users,source,complete_monitor,complete_analytic,complete_client',
            user_type: userType.id
        };


        if (searchParams) {
            for (const item of searchParams.entries()) {
                requestForm[item[0]] = item[1];
            }
        }

        this.props.onSetAppProgress({
            inProgress: true,
            withBlockedOverlay: true
        });

        ArticleService
            .get(this.state.articleId, requestForm)
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
                const fields = form.project.projectFields.find(f => f.user_type_id === userType.id);

                if (fields && fields.data) {
                    fields.data = fields.data.sort((a, b) => a.order - b.order);
                }

                if (!this.props.currentProject) {
                    this.props.setCurrentProject(form.project);
                }

                newState.articleId = form.id;
                newState.articlesNavs = articlesNavs;
                newState.projectFields = fields ? fields.data : [];
                newState.sections = sections.sort((a, b) => a.position - b.position);
                newState.form = form;
                newState.prevForm = _.cloneDeep(form);
                newState.textIsChanged = false;
                newState.annotationIsChanged = false;

                this.setState(newState);
                this.props.setCurrentArticle(this.article);
            })
            .finally(() => {
                this.props.onSetAppProgress({
                    inProgress: false,
                    withBlockedOverlay: false
                });
            });
    };

    getDataSectionFields = () => {
        const { projectFields } = this.state;
        const clonedFields = projectFields && projectFields.length ? _.cloneDeep(projectFields) : [];

        const dataSectionFields = clonedFields.filter(({ slug }) => {
            return !this.unSortableFields.includes(slug);
        });

        return dataSectionFields
            .filter(({ slug }) => slug !== 'user_id')
            .sort((a, b) => a.order - b.order);
    };

    createSource = (name, cb) => {
        SourceService.create({ name })
            .then((res) => {
                OperatedNotification.success({
                    title: 'Создание источника',
                    message: 'Новый источник успешно создан',
                    timeOut: 10000,
                    onSubmit: () => {}
                });
                return cb(res.data.id);
            })
            .catch(() => {
                OperatedNotification.warning({
                    title: 'Создание источника',
                    message: 'Не удалось создать новый источник',
                    timeOut: 10000,
                    onSubmit: () => {}
                });
            });
    }

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
        const { userType } = this.props;
        const { projectFields, roles } = this.state;
        const readOnly = !isProjectAccess([ PROJECT_PERMISSION.EDIT ]) && !isRolesAccess(roles?.admin);

        if (readOnly) return;

        ProjectService.cancelLast();
        ProjectService.put(this.state.projectId, {
            projectFields: [ {
                data: projectFields,
                user_type_id: userType.id
            } ]
        });
    };

    checkFormChanges = () => {
        const { prevForm, form, textIsChanged, annotationIsChanged } = this.state;
        const autoSaveArticles = !!StorageService.get(STORAGE_KEY.AUTO_SAVE_ARTICLES);

        return new Promise((resolve) => {
            const prevFormClone = _.cloneDeep(prevForm);
            const formClone = _.cloneDeep(form);

            let isEqual = true;

            if (textIsChanged || annotationIsChanged) {
                isEqual = false;
            }

            delete prevFormClone.project;
            delete formClone.project;
            delete prevFormClone.text;
            delete formClone.text;
            delete prevFormClone.annotation;
            delete formClone.annotation;

            // prevFormClone.section_main_id = _.get(prevFormClone.section_main_id, 'value');
            // formClone.section_main_id = _.get(formClone.section_main_id, 'value');

            prevFormClone.source = _.get(prevFormClone.source, 'value');
            formClone.source = _.get(formClone.source, 'value');

            if (prevFormClone.date) {
                prevFormClone.date = prevFormClone.date.toString();
                formClone.date = formClone.date.toString();
            }

            Object.keys(prevFormClone).forEach(key => {
                if (!_.isEqual(prevFormClone[key], formClone[key])) {
                    isEqual = false;
                }
            });

            if (!isEqual) {
                if (autoSaveArticles) {
                    // save article
                    this.handleSubmit(false)
                        .then(() => resolve());
                } else {
                    return OperatedNotification.warning({
                        title: 'Внимание',
                        message: 'Есть несохраненные изменения.\nПродолжить без сохранения?',
                        submitButtonText: 'Продолжить',
                        cancelButtonText: 'Сохранять',
                        closeOnClick: true,
                        onSubmit: () => resolve(),
                        onCancel: () => {
                            this.handleSubmit(false)
                                .then(() => resolve());
                        }
                    });
                }
            } else {
                return resolve();
            }
        });
    };

    articleId = this.props.match.params.articleId;

    unSortableFields = [ 'annotation', 'text', 'complete_monitor', 'complete_analytic', 'complete_client' ];

    article = null;

    renderField = (field) => {
        const { roles } = this.props;
        const { form, sections, sectionsTwo, sectionsThree } = this.state;
        const getValue = (prop) => _.isObject(prop) ? prop.value : prop;

        field.readOnly = !isProjectAccess([ PROJECT_PERMISSION.EDIT ]) && !isRolesAccess(roles?.admin);

        switch (field.slug) {
            case 'source_id':
                field.requestService = SourceService.get;
                field.requestCancelService = SourceService.cancelLast;
                field.editable = true;
                field.onCreateOption = (value) => this.handleCreateSourceInArticle(value);
                break;
            case 'source_type_id':
                field.requestService = SourceService.type.get;
                field.requestCancelService = SourceService.cancelLast;
                break;
            case 'source_category_id':
                field.requestService = SourceService.category.get;
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
                field.isHidden = !sectionsTwo.length || false;
                break;
            case 'section_three_id':
                field.options = sectionsThree.map(({ name, id }) => ({ label: name, value: id }));
                field.isHidden = !sectionsThree.length || false;
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
                isHidden={field?.isHidden}
            />
        );
    };

    render() {
        const { appProgress, roles, userType } = this.props;
        const {
            articlesNavs,
            form,
            showViewSettings,
            showLocationModal,
            viewType,
            projectFields
        } = this.state;
        const isUpdate = !!this.state.articleId;
        const dataSectionFields = this.getDataSectionFields();
        const readOnly = !isProjectAccess([ PROJECT_PERMISSION.EDIT ]) && !isRolesAccess(roles?.admin);
        const annotationField = projectFields.find(({ slug }) => slug === 'annotation');
        const textField = projectFields.find(({ slug }) => slug === 'text');
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

        const sectionAnnotation = annotationField ? (
            <section {...cls('section')}>
                <TinyMCE
                    key={form.id}
                    {...cls('field', 'annotation')}
                    readOnly={readOnly}
                    required={textField.required}
                    label='Аннотация'
                    content={form.annotation || ''}
                    onEditorChange={value => this.handleChangeForm(value, 'annotation')}
                    onChange={() => this.setState({ annotationIsChanged: true })}
                    height={250}
                    canCopyPaste
                />
            </section>
        ) : null;

        const sectionText = textField ? (
            <section {...cls('section')}>
                <TinyMCE
                    key={form.id + 1}
                    {...cls('field', 'textarea')}
                    readOnly={readOnly}
                    required={textField.required}
                    label='Текст статьи'
                    content={form.text || ''}
                    onEditorChange={value => this.handleChangeForm(value, 'text')}
                    onChange={() => this.setState({ textIsChanged: true })}
                    canCopyPaste
                />
            </section>
        ) : null;

        return (
            <Page withBar staticBar {...cls()}>
                <Breadcrumbs location={this.props.location} />

                <ArticlePageHeader
                    articleTitle={form.title}
                    articleId={this.articleId}
                    onBackBtn={this.handleClickBackButton}
                    articlesNavs={articlesNavs}
                    onPrevArticle={this.handlePrevArticle}
                    onNextArticle={this.handleNextArticle}
                    onClickViewSettings={this.handleShowViewSettings}
                    isUpdate={isUpdate}
                    onAddCity={() => this.setState({ showLocationModal: true })}
                    onShowReprints={this.handleShowDrawer}
                    form={form}
                    userType={userType}
                    onSubmit={() => this.form.submit()}
                    onDoneArticle={this.handleDoneArticle}
                    onDeleteArticle={this.handleDeleteArticle}
                />

                {!appProgress.inProgress && (
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
                )}

                <Drawer
                    title="Перепечатки"
                    position="right"
                    closeOnEsc
                    closeOnOverlay
                    closeOnButton
                    isOpen={this.state.showDrawer}
                    onClose={this.handleCloseDrawer}
                >
                    <Reprints
                        reprints={this.state.form.reprints}
                        loadedSources={this.state.loadedSources || []}
                        loadedCities={this.state.loadedCities || []}
                        SourceService={SourceService}
                        LocationService={LocationService}
                        ArticleService={ArticleService}
                        onFieldChange={this.handleChangeReprints}
                        onAddReprint={this.handleAddReprint}
                        onDeleteReprint={this.handleDeleteReprint}
                        onDeleteReprints={this.handleDeleteReprints}
                        onCreateArticleFromReprint={this.handleCreateArticleFromReprint}
                        onCreateSourceInReprints={this.handleCreateSourceInReprints}
                        onSaveReprintsOnly={this.handleSaveReprintsOnly}
                        currentProject={this.props.currentProject}
                        currentArticle={this.props.currentArticle}
                        userTypeId={this.props.userType.id}
                    />
                </Drawer>

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
            </Page>
        );
    }
}

function mapStateToProps(state) {
    const roles = {};

    state.roles.forEach(({ name }) => roles[name] = name);

    return {
        appProgress: state.appProgress,
        userTypes: state.userTypes,
        userType: state.userType,
        currentProject: state.currentProject,
        currentArticle: state.currentArticle,
        currentArchive: state.currentArchive,
        profile: state.profile,
        roles
    };
}

function mapDispatchToProps(dispatch) {
    return {
        setCurrentArticle: (value) => dispatch(setCurrentArticle(value)),
        clearCurrentArticle: () => dispatch(clearCurrentArticle()),
        setCurrentProject: (value) => dispatch(setCurrentProject(value)),
        onSetAppProgress: (value) => dispatch(setAppProgress(value))
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ArticlePage);
