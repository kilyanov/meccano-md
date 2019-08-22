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
import {OperatedNotification} from '../../../helpers/Tools';
import {STORAGE_KEY} from '../../../constants/LocalStorageKeys';

const classes = new Bem('article-create-page');

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
            Promise.all([
                ArticleService.get(this.articleId, {expand: 'project.fields,project.sections,source'}),
                ArticleService.getList({project: this.projectId})
            ]).then(([articleResponse, listResponse]) => {
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
                        }
                    }
                });

                this.setState({
                    articles,
                    fields: form.project.fields,
                    sections,
                    prevForm: _.cloneDeep(form),
                    form,
                    articleIndex: articles.findIndex(({id}) => id === this.articleId),
                    inProgress: false
                }); // , this.getAdditionalDataFields
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
                        this.setState({inProgress: false}, resolve);
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
            const {articles} = this.state;

            ArticleService.get(this.articleId, {expand: 'project.fields,source'}).then(response => {
                const form = response.data;

                form.date = new Date(form.date);

                this.article = _.cloneDeep(form);
                this.setState({
                    fields: form.project.fields,
                    articleIndex: articles.findIndex(({id}) => id === this.articleId),
                    form,
                    prevForm: _.cloneDeep(form),
                    inProgress: false
                });
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

            items.every(item => {
                if (item.id === sectionId) {
                    found = item;
                    return false; // for stop loop
                }

                if (item.sectionsTwo && item.sectionsTwo.length) {
                    found = r(item.sectionsTwo);
                }

                if (item.sectionsThree && item.sectionsThree.length) {
                    found = r(item.sectionsThree);
                }

                if (found) return false;
            });

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

            prevFormClone.text = prevFormClone.text && prevFormClone.text.replace(/<[^>]*>?/gm, '');
            formClone.text = formClone.text && formClone.text.replace(/<[^>]*>?/gm, '');

            if (prevFormClone.date) {
                prevFormClone.date = prevFormClone.date.toString();
                formClone.date = formClone.date.toString();
            }

            Object.keys(prevFormClone).forEach(key => {
                if (prevFormClone[key] !== formClone[key]) {
                    console.log(key, prevFormClone[key]);
                    isEqual = false;
                }
            });

            if (!isEqual) {
                return OperatedNotification.warning({
                    title: 'Внимание',
                    message: 'Есть несохраненные изменния.\nПродолжить без сохранения?',
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
                {...classes('section', 'sortable')}
                options={{
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
                            field.tags = form.authors;
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
            <section {...classes('section')}>
                <TextArea
                    {...classes('field', 'annotation')}
                    label='Аннотация'
                    value={form.annotation || ''}
                    onChange={value => this.handleChangeForm(value, 'annotation')}
                />
            </section>
        );

        const sectionText = (
            <section {...classes('section')}>
                <RichEditor
                    {...classes('field', 'textarea')}
                    label='Текст статьи'
                    content={form.text || ''}
                    onChange={value => this.handleChangeForm(value, 'text')}
                />
            </section>
        );

        return (
            <Page withBar staticBar {...classes()}>
                <section {...classes('header')}>
                    <a
                        {...classes('back-button')}
                        onClick={this.handleClickBackButton}
                    ><i>‹</i> Назад к проекту</a>

                    <div {...classes('title-wrap')}>
                        {articles.length > 1 && (
                            <button
                                {...classes('title-button', 'left')}
                                onClick={this.handlePrevArticle}
                            ><ArrowIcon {...classes('title-arrow')}/></button>
                        )}

                        <h2 {...classes('title')}>
                            {isUpdate ? 'Статья' : 'Новая статья'}
                            {!!articles.length && ` ${articleIndex + 1} из ${articles.length}`}
                        </h2>

                        {articles.length > 1 && (
                            <button
                                {...classes('title-button', 'right')}
                                onClick={this.handleNextArticle}
                            ><ArrowIcon {...classes('title-arrow')}/></button>
                        )}
                    </div>

                    <button
                        {...classes('view-button')}
                        onClick={this.handleShowViewSettings}
                    >
                        <div {...classes('view-button-icon')}>
                            <i/><i/><i/>
                        </div>

                        <span>Отображение статей</span>
                    </button>

                    <Button
                        {...classes('submit-button')}
                        text={isUpdate ? 'Обновить' : 'Создать'}
                        onClick={() => this.form.submit()}
                    />
                </section>

                <Form onSubmit={this.handleSubmit} ref={node => this.form = node}>
                    {viewType === 1 && (
                        <div {...classes('row', '', 'row')}>
                            <div {...classes('col', '', 'col-lg-6')}>
                                {sectionData}
                            </div>

                            <div {...classes('col', '', 'col-lg-6')}>
                                {sectionAnnotation}
                                {sectionText}
                            </div>
                        </div>
                    )}

                    {viewType === 2 && (
                        <div {...classes('row', '', 'row')}>
                            <div {...classes('col', '', 'col-lg-6')}>
                                {sectionAnnotation}
                                {sectionText}
                            </div>

                            <div {...classes('col', '', 'col-lg-6')}>
                                {sectionData}
                            </div>
                        </div>
                    )}

                    {viewType === 3 && (
                        <div {...classes('row', '', 'row')}>
                            <div {...classes('col', '', 'col-lg-6')}>
                                {sectionText}
                            </div>

                            <div {...classes('col', '', 'col-lg-6')}>
                                {sectionData}
                                {sectionAnnotation}
                            </div>
                        </div>
                    )}

                    {viewType === 4 && (
                        <div {...classes('row', '', 'row')}>
                            <div {...classes('col', '', 'col-xs-12')}>
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
