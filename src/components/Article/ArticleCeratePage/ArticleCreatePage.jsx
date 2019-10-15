import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Page from '../../Shared/Page/Page';
import {ArticleService, LocationService, ProjectService, SourceService, StorageService} from '../../../services';
import './article-create-page.scss';
import Form from '../../Form/Form/Form';
import TextArea from '../../Form/TextArea/TextArea';
import RichEditor from '../../Form/RichEditor/RichEditor';
import Loader from '../../Shared/Loader/Loader';
import ArrowIcon from '../../Shared/SvgIcons/ArrowIcon';
import Button from '../../Shared/Button/Button';
import ArticleViewSettings from './ArticleViewSettings/ArticleViewSettings';
import ProjectCreateField from '../../Project/ProjectCreatePage/ProjectCreatePageField/ProjectCreatePageField';
import Sortable from 'react-sortablejs';
import {isMobileScreen, OperatedNotification} from '../../../helpers/Tools';
import {STORAGE_KEY} from '../../../constants/LocalStorageKeys';

const cls = new Bem('article-create-page');
const sectionsSet = {
    'section_main_id': 'sectionsTwo',
    'section_sub_id': 'sectionsThree'
};

export default class ArticleCreatePage extends Component {
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
        this.state = {
            articles: [],
            fields: [],
            sources: [],
            articleIndex: 0,
            prevForm: _.clone(this.defaultForm),
            form: _.clone(this.defaultForm),
            selectedMedia: {},
            viewType: StorageService.get(STORAGE_KEY.ARTICLE_VIEW_TYPE) || 1,
            showViewSettings: false,
            inProgress: true
        };
    }

    componentDidMount() {
        if (this.articleId) {
            const {location} = this.props;
            const searchParams = location.search && new URLSearchParams(location.search);
            const form = {
                expand: 'project.fields,project.sections,source'
            };

            if (searchParams) {
                for (let item of searchParams.entries()) {
                    form[item[0]] = item[1];
                }
            }

            Promise.all([
                ArticleService.get(this.articleId, form),
                ArticleService.getList({project: this.projectId})
            ]).then(([articleResponse, listResponse]) => {
                const newState = this.state;
                const form = articleResponse.data;
                const articles = listResponse.data;
                const sections = form.project.sections;

                this.article = _.cloneDeep(form);
                form.date = new Date(form.date);
                form.source = {name: _.get(form, 'source.name'), value: _.get(form, 'source.id')};

                ['section_main_id', 'section_sub_id', 'section_three_id'].forEach(option => {
                    if (form[option]) {
                        const found = this.findSectionById(form[option], sections);

                        if (found) {
                            form[option] = {name: found.name, value: found.id, ...found};
                            newState[sectionsSet[option]] = found[sectionsSet[option]];
                        }
                    }
                });

                newState.articles = articles;
                newState.fields = form.project.fields;
                newState.sections = sections;
                newState.prevForm = _.cloneDeep(form);
                newState.form = form;
                newState.articleIndex = articles.findIndex(({id}) => id === this.articleId);
                newState.inProgress = false;

                this.setState(newState); // , this.getAdditionalDataFields
            }).catch(() => this.setState({inProgress: false}));
        } else {
            ProjectService.get({expand: 'fields,sections'}, this.projectId).then(response => {
                const project = response.data;

                if (project && project.fields) {
                    this.setState({
                        sections: project.sections,
                        fields: project.fields,
                        inProgress: false
                    }); // , this.getAdditionalDataFields
                }
            }).catch(() => this.setState({inProgress: false}));
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.match.params.articleId !== this.props.match.params.articleId) {
            this.articleId = this.props.match.params.articleId;
            this.getArticle();
        }
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
        const {articles, articleIndex} = this.state;

        let prevArticle = articles[articleIndex - 1];

        if (!prevArticle) {
            prevArticle = articles[articles.length - 1];
        }

        this.checkFormChanges().then(() => {
            this.context.router.history.push(`/project/${this.projectId}/article/${prevArticle.id}`);
        });
    };

    handleNextArticle = () => {
        const {articles, articleIndex} = this.state;

        let nextArticle = articles[articleIndex + 1];

        if (!nextArticle) {
            nextArticle = articles[0];
        }

        this.checkFormChanges().then(() => {
            this.context.router.history.push(`/project/${this.projectId}/article/${nextArticle.id}`);
        });
    };

    handleClickBackButton = () => {
        this.checkFormChanges().then(() => {
            this.context.router.history.push(`/project/${this.projectId}`);
        });
    };

    handleEndSort = (sortedKeys) => {
        const {fields} = this.state;
        const sortedList = sortedKeys.map(key => fields.find(({code}) => code === key)).filter(item => !!item);

        this.setState({fields: sortedList}, this.saveFieldsSort);
    };

    handleSubmit = () => {
        const form = {...this.state.form};
        const isUpdate = !!this.articleId;
        const invalidateFields = [];

        form.date = moment(form.date).format();

        delete form.project;
        delete form.source;

        ['section_main_id', 'section_sub_id', 'section_three_id']
            .forEach(option => {
                if (form[option] && form[option].value) {
                    form[option] = form[option].value;
                }
            });

        // Check required
        this.state.fields
            .filter(({required}) => required)
            .forEach(field => {
                if (!form[field.code] ||
                    (form[field.code] instanceof Array && _.isEmpty(form[field.code])) ||
                    (form[field.code] instanceof Object && _.isEmpty(form[field.code]))
                ) {
                    invalidateFields.push(field);
                }
            });

        // Check new properties
        Object.keys(form).forEach(key => {
            if (isUpdate && form[key] === this.article[key] && key !== 'id') {
                delete form[key];
            }
        });

        if (_.isEmpty(form)) return;

        form.project_id = this.projectId;

        const submitForm = () => {
            return new Promise(resolve => {
                this.setState({inProgress: true}, () => {
                    ArticleService[isUpdate ? 'update' : 'create'](form, form.id).then(() => {
                        OperatedNotification.success({
                            title: `${isUpdate ? 'Обновление' : 'Создание'} статьи`,
                            message: `Статья успешно ${isUpdate ? 'обновлена' : 'создана'}`,
                            submitButtonText: '← Перейти ко всем статьям',
                            timeOut: 10000,
                            onSubmit: () => this.context.router.history.push(`/project/${this.projectId}`)
                        });
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

    getArticle = () => {
        this.setState({inProgress: true}, () => {
            ArticleService.get(this.articleId, {expand: 'project.fields,source'}).then(response => {
                const newState = this.state;
                const form = response.data;

                form.date = new Date(form.date);

                ['section_main_id', 'section_sub_id', 'section_three_id'].forEach(option => {
                    if (form[option]) {
                        const found = this.findSectionById(form[option], this.state.sections);

                        if (found) {
                            form[option] = {name: found.name, value: found.id, ...found};
                            newState[sectionsSet[option]] = found[sectionsSet[option]];
                        }
                    }
                });

                this.article = _.cloneDeep(form);

                newState.fields = form.project.fields;
                newState.articleIndex = newState.articles.findIndex(({id}) => id === this.articleId);
                newState.form = form;
                newState.prevForm = _.cloneDeep(form);
                newState.inProgress = false;

                this.setState(newState);
            }).catch(() => this.setState({inProgress: false}));
        });
    };

    getDataSectionFields = () => {
        const {form, sectionsTwo, sectionsThree, fields} = this.state;

        let dataSectionFields = _.cloneDeep(fields).filter(({code}) => code !== 'annotation' && code !== 'text');

        if (!form.section_main_id || !sectionsTwo || !sectionsTwo.length) {
            dataSectionFields = dataSectionFields.filter(({code}) => code !== 'section_sub_id');
        }

        if (!form.section_sub_id || !sectionsThree || !sectionsThree.length) {
            dataSectionFields = dataSectionFields.filter(({code}) => code !== 'section_three_id');
        }

        return dataSectionFields;
    };

    findSectionById = (sectionId, sections) => {
        const r = (items) => {
            let found = null;

            for (let item of items) {
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
        const {fields} = this.state;

        ProjectService.cancelLast();
        ProjectService.put(this.projectId, {fields});
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
                    console.log(key, prevFormClone[key], formClone[key]);
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

    article = null;

    render() {
        const {
            articles,
            articleIndex,
            form,
            showViewSettings,
            sections,
            sectionsTwo,
            sectionsThree,
            viewType,
            inProgress
        } = this.state;
        const isUpdate = !!this.articleId;
        const dataSectionFields = this.getDataSectionFields();
        const getValue = (prop) => _.isObject(prop) ? prop.value : prop;
        const sectionData = (
            <Sortable
                {...cls('section', 'sortable')}
                options={{
                    disabled: isMobileScreen(),
                    animation: 150,
                    handle: '.drag-handle'
                }}
                onChange={this.handleEndSort}
            >
                {dataSectionFields.map(field => {
                    switch (field.code) {
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
                            key={field.code}
                            field={field}
                            placeholder={field.placeholder}
                            value={form[field.code] || ''}
                            onChange={this.handleChangeForm}
                        />
                    );
                })}
            </Sortable>
        );

        const sectionAnnotation = (
            <section {...cls('section')}>
                <RichEditor
                    {...cls('field', 'annotation')}
                    label='Аннотация'
                    content={form.annotation || ''}
                    onChange={value => this.handleChangeForm(value, 'annotation')}
                />
            </section>
        );

        const sectionText = (
            <section {...cls('section')}>
                <RichEditor
                    {...cls('field', 'textarea')}
                    label='Текст статьи'
                    content={form.text || ''}
                    onChange={value => this.handleChangeForm(value, 'text')}
                />
            </section>
        );

        return (
            <Page withBar staticBar {...cls()}>
                <section {...cls('header')}>
                    <a
                        {...cls('back-button')}
                        onClick={this.handleClickBackButton}
                    ><i>‹</i> Назад к проекту</a>

                    <div {...cls('title-wrap')}>
                        {articles.length > 1 && (
                            <button
                                {...cls('title-button', 'left')}
                                onClick={this.handlePrevArticle}
                            ><ArrowIcon {...cls('title-arrow')}/></button>
                        )}

                        <h2 {...cls('title')}>
                            {isUpdate ? 'Статья' : 'Новая статья'}
                            {!!articles.length && ` ${articleIndex + 1} из ${articles.length}`}
                        </h2>

                        {articles.length > 1 && (
                            <button
                                {...cls('title-button', 'right')}
                                onClick={this.handleNextArticle}
                            ><ArrowIcon {...cls('title-arrow')}/></button>
                        )}
                    </div>

                    <button
                        {...cls('view-button')}
                        onClick={this.handleShowViewSettings}
                    >
                        <div {...cls('view-button-icon')}>
                            <i/><i/><i/>
                        </div>

                        <span>Отображение статей</span>
                    </button>

                    <Button
                        {...cls('submit-button')}
                        text={isUpdate ? 'Обновить' : 'Создать'}
                        onClick={() => this.form.submit()}
                    />
                </section>

                <Form onSubmit={this.handleSubmit} ref={node => this.form = node}>
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
