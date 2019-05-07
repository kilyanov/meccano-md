import React, {Component} from 'react';
import Page from '../../Shared/Page/Page';
import {ArticleService, StorageService} from '../../../services';
import {NotificationManager} from 'react-notifications';
import './article-create-page.scss';
import Form from '../../Form/Form/Form';
import InputText from '../../Form/InputText/InputText';
import InputDatePicker from '../../Form/InputDatePicker/InputDatePicker';
import Select from '../../Form/Select/Select';
import TextArea from '../../Form/TextArea/TextArea';
import RichEditor from '../../Form/RichEditor/RichEditor';
import Loader from '../../Shared/Loader/Loader';
import BackButton from '../../Shared/BackButton/BackButton';
import ArrowIcon from '../../Shared/SvgIcons/ArrowIcon';
import Button from '../../Shared/Button/Button';
import ArticleViewSettings from './ArticleViewSettings/ArticleViewSettings';
import {EventEmitter} from '../../../helpers';

const classes = new Bem('article-create-page');

export default class ArticleCreatePage extends Component {
    constructor(props) {
        super(props);

        this.articleId = props.match.params.articleId;
        this.projectId = props.match.params.projectId;
        this.state = {
            articles: [],
            articleIndex: 0,
            form: {
                title: '',
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
                ArticleService.get(this.articleId, {expand: 'text,url,number,sectionFirst,sectionSecond,sectionThird'}),
                ArticleService.getList({project: this.projectId})
            ]).then(([articleResponse, listResponse]) => {
                const articles = listResponse.data;
                const form = articleResponse.data;

                this.article = _.cloneDeep(form);
                form.date = new Date(form.date);

                this.setState({
                    articles,
                    form,
                    articleIndex: articles.findIndex(({id}) => id === this.articleId),
                    inProgress: false
                });
            }).catch(() => this.setState({inProgress: false}));
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

        const sectionData = (
            <section {...classes('section')}>
                <div {...classes('row', '', 'row')}>
                    <div {...classes('field', '', 'col-xs-12')}>
                        <InputText
                            label='Название'
                            value={form.title || ''}
                            onChange={value => this.handleChangeForm(value, 'title')}
                        />
                    </div>
                </div>

                <div {...classes('row', '', 'row')}>
                    <div {...classes('field', '', 'col-lg-5')}>
                        <InputDatePicker
                            label='Дата'
                            value={form.date}
                            onChange={value => this.handleChangeForm(value, 'date')}
                        />
                    </div>
                    <div {...classes('field', '', 'col-lg-7')}>
                        <Select
                            placeholder='Выберите источник...'
                            label='Источник'
                            options={this.sources}
                            selected={this.state.selectedMedia}
                            onChange={selectedMedia => this.setState({selectedMedia})}
                        />
                    </div>
                </div>

                <div {...classes('row', '', 'row')}>
                    <div {...classes('col', '', 'col-lg-12')}>
                        <InputText
                            label='URL'
                            validateType='link'
                            validateErrorMessage='Неверный адрес ссылки'
                            value={form.url || ''}
                            onChange={value => this.handleChangeForm(value, 'url')}
                        />
                    </div>
                </div>

                <div {...classes('row', '', 'row')}>
                    <div {...classes('col', '', 'col-lg-4')}>
                        <InputText
                            label='Раздел 1'
                            value={form.sectionFirst || ''}
                            onChange={value => this.handleChangeForm(value, 'sectionFirst')}
                        />
                    </div>
                    <div {...classes('col', '', 'col-lg-4')}>
                        <InputText
                            label='Раздел 2'
                            value={form.sectionSecond || ''}
                            onChange={value => this.handleChangeForm(value, 'sectionSecond')}
                        />
                    </div>
                    <div {...classes('col', '', 'col-lg-4')}>
                        <InputText
                            label='Раздел 3'
                            value={form.sectionThird || ''}
                            onChange={value => this.handleChangeForm(value, 'sectionThird')}
                        />
                    </div>
                </div>

                <div {...classes('row', '', 'row')}>
                    <div {...classes('col', '', 'col-lg-6')}>
                        <InputText
                            label='Автор'
                            value={form.author || ''}
                            onChange={value => this.handleChangeForm(value, 'author')}
                        />
                    </div>
                    <div {...classes('col', '', 'col-lg-6')}>
                        <InputText
                            label='Город'
                            value='' // {form.city}
                        />
                    </div>
                </div>

                <div {...classes('row', '', 'row')}>
                    <div {...classes('col', '', 'col-lg-6')}>
                        <InputText
                            label='Область/край'
                            value='' // {form.region}
                        />
                    </div>
                    <div {...classes('col', '', 'col-lg-6')}>
                        <InputText
                            label='Федеральный округ'
                            value='' // {form.federalDistrict}
                        />
                    </div>
                </div>

                <div {...classes('row', '', 'row')}>
                    <div {...classes('col', '', 'col-lg-6')}>
                        <InputText
                            label='Код СМИ'
                            value=''
                        />
                    </div>
                    <div {...classes('col', '', 'col-lg-6')}>
                        <InputText
                            label='Вид СМИ'
                            value=''
                        />
                    </div>
                </div>

                <div {...classes('row', '', 'row')}>
                    <div {...classes('col', '', 'col-lg-6')}>
                        <InputText
                            label='Ноиер'
                            value={form.number || ''}
                            onChange={value => this.handleChangeForm(value, 'number')}
                        />
                    </div>
                    <div {...classes('col', '', 'col-lg-6')}>
                        <InputText
                            label='Еще поле по СМИ'
                            value=''
                        />
                    </div>
                </div>
            </section>
        );

        const sectionAnnotation = (
            <TextArea
                label='Аннотация'
                value={form.annotation || ''}
                onChange={value => this.handleChangeForm(value, 'annotation')}
            />
        );

        const sectionText = (
            <RichEditor
                {...classes('field', 'textarea')}
                label='Текст статьи'
                content={form.text}
                onChange={value => this.handleChangeForm(value, 'text')}
            />
        );

        return (
            <Page withBar {...classes()}>
                <section {...classes('header')}>
                    <BackButton
                        {...classes('back-button')}
                        to={`/project/${this.projectId}`}
                    />

                    <div {...classes('title-wrap')}>
                        {!!articles.length && (
                            <button
                                {...classes('title-button', 'left')}
                                onClick={this.handlePrevArticle}
                            ><ArrowIcon {...classes('title-arrow')}/></button>
                        )}

                        <h2 {...classes('title')}>
                            {isUpdate ? 'Статья' : 'Новая статья'}
                            {!!articles.length && ` ${articleIndex + 1} из ${articles.length}`}
                        </h2>

                        {!!articles.length && (
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
