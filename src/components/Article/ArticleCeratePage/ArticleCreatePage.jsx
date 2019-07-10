import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Page from '../../Shared/Page/Page';
import {ArticleService, ProjectService, SourceService, StorageService} from '../../../services';
import './article-create-page.scss';
import Form from '../../Form/Form/Form';
import TextArea from '../../Form/TextArea/TextArea';
import RichEditor from '../../Form/RichEditor/RichEditor';
import Loader from '../../Shared/Loader/Loader';
import BackButton from '../../Shared/BackButton/BackButton';
import ArrowIcon from '../../Shared/SvgIcons/ArrowIcon';
import Button from '../../Shared/Button/Button';
import ArticleViewSettings from './ArticleViewSettings/ArticleViewSettings';
import {EventEmitter} from '../../../helpers';
import ProjectCreateField from '../../Project/ProjectCreatePage/ProjectCreatePageField/ProjectCreatePageField';
import Sortable from 'react-sortablejs';
import {OperatedNotification} from '../../../helpers/Tools';
import {STORAGE_KEY} from '../../../constants/LocalStorageKeys';
import {EVENTS} from '../../../constants/Events';

const classes = new Bem('article-create-page');

export default class ArticleCreatePage extends Component {
    static propTypes = {
        country: PropTypes.array,
        city: PropTypes.array,
        federal: PropTypes.array,
        region: PropTypes.array
    };

    constructor(props) {
        super(props);

        this.articleId = props.match.params.articleId;
        this.projectId = props.match.params.projectId;
        this.state = {
            articleId: this.articleId,
            articles: [],
            fields: [],
            sources: [],
            articleIndex: 0,
            form: {
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
            },
            selectedMedia: {},
            viewType: StorageService.get(STORAGE_KEY.ARTICLE_VIEW_TYPE) || 1,
            showViewSettings: false,
            inProgress: true
        };
    }

    componentDidMount() {
        if (this.articleId) {
            Promise.all([
                ArticleService.get(this.articleId, {expand: 'project.fields,project.sections'}),
                ArticleService.getList({project: this.projectId}),
                SourceService.get()
            ]).then(([articleResponse, listResponse, sourceResponse]) => {
                const form = articleResponse.data;
                const articles = listResponse.data;
                const sources = sourceResponse.data;
                const sections = form.project.sections;

                this.article = _.cloneDeep(form);
                form.date = new Date(form.date);

                ['section_main_id', 'section_sub_id', 'section_three_id'].forEach(option => {
                    if (form[option]) {
                        const found = this.findSectionById(form[option], sections);

                        if (found) {
                            form[option] = {name: found.name, value: found.id, ...found};
                        }
                    }
                });

                if (form.source_id && sources.length) {
                    const currentSource = sources.find(({id}) => id === form.source_id);

                    if (currentSource) form.source_id = {name: currentSource.name, value: currentSource.id};
                }

                this.setState({
                    articles,
                    fields: form.project.fields,
                    sections,
                    form,
                    sources,
                    articleIndex: articles.findIndex(({id}) => id === this.articleId),
                    inProgress: false
                }, this.getAdditionalDataFields);
            }).catch(() => this.setState({inProgress: false}));
        } else {
            ProjectService.get({expand: 'fields,sections'}, this.projectId).then(response => {
                const project = response.data;

                if (project && project.fields) {
                    this.setState({
                        sections: project.sections,
                        fields: project.fields,
                        inProgress: false
                    }, this.getAdditionalDataFields);
                }
            }).catch(() => this.setState({inProgress: false}));
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.match.params.articleId !== this.props.match.params.articleId) {
            this.articleId = this.props.match.params.articleId;
            this.getArticle();
        }

        if (
            this.state.form.source_id &&
            _.isString(this.state.form.source_id) &&
            this.state.sources.length
        ) {
            const currentSource = this.state.sources.find(({id}) => id === this.state.form.source_id);

            if (currentSource) {
                this.setState(prev => {
                    return prev.form.source_id = {name: currentSource.name, value: currentSource.id};
                });
            }
        }
    }

    handleChangeForm = (value, option) => {
        this.setState(({form}) => {
            form[option] = value;

            if (option === 'section_main_id') {
                form.section_sub_id = null;
                form.section_three_id = null;
            }

            if (option === 'section_sub_id') {
                form.section_three_id = null;
            }

            return form;
        });
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

        EventEmitter.emit(EVENTS.REDIRECT, `/project/${this.projectId}/article/${prevArticle.id}`);
    };

    handleNextArticle = () => {
        const {articles, articleIndex} = this.state;

        let nextArticle = articles[articleIndex + 1];

        if (!nextArticle) {
            nextArticle = articles[0];
        }

        EventEmitter.emit(EVENTS.REDIRECT, `/project/${this.projectId}/article/${nextArticle.id}`);
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

        if (form.source_id) form.source_id = form.source_id.value;
        if (form.genre_id) form.genre_id = form.genre_id.value;

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
            if (!form[key]) delete form[key];

            if (isUpdate) {
                if (form[key] === this.article[key] && key !== 'id') {
                    delete form[key];
                }
            }
        });

        if (_.isEmpty(form)) return;

        form.project_id = this.projectId;

        const submitForm = () => {
            this.setState({inProgress: true}, () => {
                ArticleService[isUpdate ? 'update' : 'create'](form, form.id).then(() => {
                    OperatedNotification.success({
                        title: `${isUpdate ? 'Обновление' : 'Создание'} статьи`,
                        message: `Статья успешно ${isUpdate ? 'обновлена' : 'создана'}`,
                        submitButtonText: '← Перейти ко всем статьям',
                        timeOut: 10000,
                        onSubmit: () => EventEmitter.emit(EVENTS.REDIRECT, `/project/${this.projectId}`)
                    });
                    this.setState({inProgress: false});
                }).catch(() => this.setState({inProgress: false}));
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

        submitForm();
    };

    getArticle = () => {
        this.setState({inProgress: true}, () => {
            const {articles} = this.state;

            ArticleService.get(this.articleId, {expand: 'project.fields'}).then(response => {
                const form = response.data;

                form.date = new Date(form.date);

                this.article = _.cloneDeep(form);
                this.setState({
                    fields: form.project.fields,
                    articleIndex: articles.findIndex(({id}) => id === this.articleId),
                    form,
                    inProgress: false
                });
            }).catch(() => this.setState({inProgress: false}));
        });
    };

    getDataSectionFields = () => {
        const {form, fields} = this.state;

        let dataSectionFields = _.cloneDeep(fields).filter(({code}) => code !== 'annotation' && code !== 'text');

        if (!form.section_main_id || !_.get(form.section_main_id, 'sectionsTwo', []).length) {
            dataSectionFields = dataSectionFields.filter(({code}) => code !== 'section_sub_id');
        }

        if (!form.section_sub_id || !!_.get(form.section_sub_id, 'sectionsThree.length', []).length) {
            dataSectionFields = dataSectionFields.filter(({code}) => code !== 'section_three_id');
        }

        return dataSectionFields;
    };

    getAdditionalDataFields = () => {
        const {fields} = this.state;
        const stackRequest = {};

        if (fields.find(({code}) => code === 'type_id') && !this.state.types) {
            stackRequest.types = ArticleService.types();
        }

        if (fields.find(({code}) => code === 'genre_id') && !this.state.genres) {
            stackRequest.genres = ArticleService.genre();
        }

        if (fields.find(({code}) => code === 'heading_id') && !this.state.headings) {
            stackRequest.headings = ArticleService.heading();
        }

        if (!_.isEmpty(stackRequest)) {
            Promise.all(_.values(stackRequest)).then((stackResponse) => {
                const newState = this.state;
                const keys = Object.keys(stackRequest);

                stackResponse.map((data, index) => {
                    newState[keys[index]] = data.data.map(({id, name}) => ({name, value: id}));
                });

                this.setState(newState);
            });
        }
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

    article = null;

    render() {
        const {articles, articleIndex, form, showViewSettings, sections, viewType, inProgress} = this.state;
        const isUpdate = !!this.articleId;
        const dataSectionFields = this.getDataSectionFields();
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
                            field.options = sections.map(({name, id, sectionsTwo}) => ({name, value: id, sectionsTwo}));
                            break;
                        case 'section_sub_id':
                            field.options = _.get(form, 'section_main_id.sectionsTwo', [])
                                .map(({name, id, sectionsThree}) => ({name, value: id, sectionsThree}));
                            break;
                        case 'section_three_id':
                            field.options = _.get(form, 'section_sub_id.sectionsThree', [])
                                .map(({name, id}) => ({name, value: id}));
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
            <Page withBar {...classes()}>
                <section {...classes('header')}>
                    <BackButton
                        {...classes('back-button')}
                        to={`/project/${this.projectId}`}
                        force
                    />

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
