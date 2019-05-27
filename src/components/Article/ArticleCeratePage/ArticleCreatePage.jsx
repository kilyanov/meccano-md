import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Page from '../../Shared/Page/Page';
import {ArticleService, SourceService, StorageService} from '../../../services';
import {NotificationManager} from 'react-notifications';
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
import store from '../../../redux/store';
import {getSource} from '../../../redux/actions/source';

const classes = new Bem('article-create-page');

class ArticleCreatePage extends Component {
    static propTypes = {
        projects: PropTypes.array.isRequired,
        country: PropTypes.array,
        city: PropTypes.array,
        federal: PropTypes.array,
        region: PropTypes.array,
        source: PropTypes.array
    };

    constructor(props) {
        super(props);

        this.articleId = props.match.params.articleId;
        this.projectId = props.match.params.projectId;
        this.state = {
            articleId: this.articleId,
            articles: [],
            fields: [],
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
                author: '',
                number: '',
                annotation: '',
                text: ''
            },
            selectedMedia: {},
            viewType: StorageService.get('article-view-type') || 1,
            showViewSettings: false,
            inProgress: true
        };
    }

    componentDidMount() {
        if (this.articleId) {
            Promise.all([
                ArticleService.get(this.articleId, {expand: 'project.fields,project.sections'}),
                ArticleService.getList({project: this.projectId})
            ]).then(([articleResponse, listResponse]) => {
                const form = articleResponse.data;
                const articles = listResponse.data;
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

                this.setState({
                    articles,
                    fields: form.project.fields,
                    sections,
                    form,
                    articleIndex: articles.findIndex(({id}) => id === this.articleId),
                    inProgress: false
                }, this.getAdditionalDataFields);
            }).catch(() => this.setState({inProgress: false}));
        } else if (this.props.projects.length) {
            const project = this.props.projects.find(({id}) => id === this.projectId);

            if (project && project.fields) {
                this.setState({
                    sections: project.sections,
                    fields: project.fields,
                    inProgress: false
                }, this.getAdditionalDataFields);
            }
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.match.params.articleId !== this.props.match.params.articleId) {
            this.articleId = this.props.match.params.articleId;
            this.getArticle();
        }

        if (!this.articleId && !this.state.fields.length && this.props.projects.length) {
            const project = this.props.projects.find(({id}) => id === this.projectId);

            if (project && project.fields) {
                this.setState({
                    sections: project.sections,
                    fields: project.fields,
                    inProgress: false
                }, this.getAdditionalDataFields);
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

        EventEmitter.emit('redirect', `/project/${this.projectId}/article/${prevArticle.id}`);
    };

    handleNextArticle = () => {
        const {articles, articleIndex} = this.state;

        let nextArticle = articles[articleIndex + 1];

        if (!nextArticle) {
            nextArticle = articles[0];
        }

        EventEmitter.emit('redirect', `/project/${this.projectId}/article/${nextArticle.id}`);
    };

    handleSubmit = () => {
        const form = {...this.state.form};
        const isUpdate = !!this.articleId;

        form.date = moment(form.date).format();

        if (form.source_id) {
            form.source_id = null;
        }

        ['section_main_id', 'section_sub_id', 'section_three_id']
            .forEach(option => {
                if (form[option] && form[option].value) {
                    form[option] = form[option].value;
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

        this.setState({inProgress: true}, () => {
            ArticleService[isUpdate ? 'update' : 'create'](form, form.id).then(() => {
                NotificationManager.success('Статья успешно добавлена в проект', 'Успех');
                this.setState({inProgress: false}, () => {
                    setTimeout(() => EventEmitter.emit('redirect', `/project/${this.projectId}`), 2000);
                });
            }).catch(() => this.setState({inProgress: false}));
        });
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

        if (fields.find(({code}) => code === 'source_id') && !this.props.source.length) {
            store.dispatch(getSource());
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

    article = null;

    render() {
        const {articles, articleIndex, form, showViewSettings, sections, viewType, inProgress} = this.state;
        const isUpdate = !!this.articleId;
        const dataSectionFields = this.getDataSectionFields();
        const sectionData = (
            <section {...classes('section')}>
                {dataSectionFields.map(field => {
                    switch (field.code) {
                        case 'source_id':
                            field.placeholder = 'Выберите источник...';
                            field.options = this.props.source.map(({id, name}) => ({name, value: id}));
                            field.onSearch = query => SourceService.get('', {'query[name]': query});
                            field.onCancelSearch = SourceService.cancelGet;
                            break;
                        case 'section_main_id':
                            field.placeholder = 'Выберите раздел...';
                            field.options = sections.map(({name, id, sectionsTwo}) => ({name, value: id, sectionsTwo}));
                            break;
                        case 'section_sub_id':
                            field.placeholder = 'Выберите раздел...';
                            field.options = _.get(form, 'section_main_id.sectionsTwo', [])
                                .map(({name, id, sectionsThree}) => ({name, value: id, sectionsThree}));
                            break;
                        case 'section_three_id':
                            field.placeholder = 'Выберите раздел...';
                            field.options = _.get(form, 'section_sub_id.sectionsThree', [])
                                .map(({name, id}) => ({name, value: id}));
                            break;
                        case 'authors':
                            field.tags = form.authors;
                            field.suggestions = this.state.suggestions;
                            break;
                        case 'genres':
                            field.tags = form.genres;
                            field.suggestions = this.state.suggestions;
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
            </section>
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

export default connect(({
    projects,
    country,
    city,
    federal,
    region,
    source
}) => ({
    projects,
    country,
    city,
    federal,
    region,
    source
}))(ArticleCreatePage);
