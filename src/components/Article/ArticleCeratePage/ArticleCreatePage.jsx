import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Page from '../../Shared/Page/Page';
import {ArticleService, StorageService} from '../../../services';
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

const classes = new Bem('article-create-page');

class ArticleCreatePage extends Component {
    static propTypes = {
        projects: PropTypes.array.isRequired
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
                sectionFirst: '',
                sectionSecond: '',
                sectionThird: '',
                author: '',
                number: '',
                annotation: '',
                text: ''
            },
            selectedMedia: {},
            viewType: StorageService.get('article-view-type') || 1,
            showViewSettings: false,
            inProgress: !!this.articleId
        };
    }

    componentDidMount() {
        if (this.articleId) {
            Promise.all([
                ArticleService.get(this.articleId, {expand: 'project.fields'}),
                ArticleService.getList({project: this.projectId})
            ]).then(([articleResponse, listResponse]) => {
                const form = articleResponse.data;
                const articles = listResponse.data;

                this.article = _.cloneDeep(form);
                form.date = new Date(form.date);

                console.log(this.article);

                this.setState({
                    articles,
                    fields: form.project.fields,
                    form,
                    articleIndex: articles.findIndex(({id}) => id === this.articleId),
                    inProgress: false
                });
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
        this.setState(prev => prev.form[option] = value);
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

    article = null;

    sources = [{
        name: 'Яндекс',
        value: 'yandex'
    }, {
        name: 'Google',
        value: 'google'
    }, {
        name: 'Mail.ru',
        value: 'mail.ru'
    }, {
        name: 'Lenta.ru',
        value: 'lenta'
    }, {
        name: 'Яндекс',
        value: 'yandex1'
    }, {
        name: 'Google',
        value: 'google1'
    }, {
        name: 'Mail.ru',
        value: 'mail.ru1'
    }, {
        name: 'Lenta.ru',
        value: 'lenta1'
    }];

    render() {
        const {articles, articleIndex, form, showViewSettings, viewType, inProgress} = this.state;
        const isUpdate = !!this.articleId;
        const dataSectionFields = this.state.fields.filter(({code}) => code !== 'annotation' && code !== 'text');

        const sectionData = (
            <section {...classes('section')}>
                {dataSectionFields.map(field => {
                    if (field.code === 'source_id') {
                        field.options = this.sources;
                    }

                    return (
                        <ProjectCreateField
                            key={field.code}
                            field={field}
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

export default connect(({projects}) => ({projects}))(ArticleCreatePage);
