import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ConfirmModal from '../../Shared/ConfirmModal/ConfirmModal';
import './article-create-modal.scss';
import InputText from '../../Form/InputText/InputText';
import TextArea from '../../Form/TextArea/TextArea';
import InputDatePicker from '../../Form/InputDatePicker/InputDatePicker';
import { ArticleService } from '../../../services/ArticleService';
import { NotificationManager } from 'react-notifications';
import Form from '../../Form/Form/Form';
import Loader from '../../Shared/Loader/Loader';
import Select from '../../Form/Select/Select';
import RichEditor from '../../Form/RichEditor/RichEditor';

const cls = new Bem('article-create-modal');

export default class ArticleCreateModal extends Component {
    static propTypes = {
        article: PropTypes.object,
        projectId: PropTypes.string.isRequired,
        onSubmit: PropTypes.func,
        onClose: PropTypes.func.isRequired,
        onAddArticle: PropTypes.func.isRequired,
        onUpdateArticle: PropTypes.func.isRequired
    };

    state = {
        form: {...this.props.article} || {
            title: '',
            date: new Date(),
            media: '',
            url: '',
            projectId: this.props.projectId,
            sectionFirst: '',
            sectionSecond: '',
            sectionThird: '',
            author: '',
            number: '',
            annotation: '',
            text: ''
        },
        selectedMedia: {},
        inProgress: false
    };

    componentDidMount() {
        const {article} = this.props;

        if (article && article.id) {
            this.setState({inProgress: true}, () => {
                ArticleService.get(article.id, {expand: 'text,url,number,sectionFirst,sectionSecond,sectionThird'})
                    .then(response => {
                        const form = response.data;

                        form.date = new Date(form.date);

                        this.setState({
                            form,
                            inProgress: false
                        });
                    });
            });
        }
    }

    handleChangeForm = (value, option) => {
        this.setState(prev => prev.form[option] = value);
    };

    handleSubmit = () => {
        const form = {...this.state.form};
        const isUpdate = !!form.id;

        Object.keys(form).forEach(key => {
            if (!form[key]) delete form[key];

            if (isUpdate) {
                if (form[key] === this.props.article[key] && key !== 'id') {
                    delete form[key];
                }
            }
        });

        if (_.isEmpty(form)) return;

        form.project_id = this.props.projectId;

        this.setState({inProgress: true}, () => {
            ArticleService[isUpdate ? 'update' : 'create'](form, form.id).then((response) => {
                const newArticle = response.data;

                NotificationManager.success('Статья успешно добавлена в проект', 'Создание статьи');

                newArticle.projectId = this.props.projectId;

                if (isUpdate) this.props.onUpdateArticle(response.data);
                else this.props.onAddArticle(response.data);

                this.setState({inProgress: false});
                this.props.onClose();
            }).catch(() => this.setState({inProgress: false}));
        });
    };

    medias = [{
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
        const {article, onClose} = this.props;
        const {form, inProgress} = this.state;
        const isUpdate = !_.isEmpty(article);

        return (
            <ConfirmModal
                {...cls()}
                title={_.get(article, 'title', 'Новая статья')}
                onClose={onClose}
                onSubmit={() => this.form.submit()}
                submitText={isUpdate ? 'Обновить' : 'Добавить'}
                width='wide'
            >
                <Form onSubmit={this.handleSubmit} ref={node => this.form = node}>
                    <div {...cls('row', '', 'row')}>
                        <div {...cls('field', '', 'col-lg-7')}>
                            <InputText
                                label='Название'
                                value={form.title || ''}
                                onChange={value => this.handleChangeForm(value, 'title')}
                            />
                        </div>
                        <div {...cls('field', '', 'col-lg-2')}>
                            <InputDatePicker
                                label='Дата'
                                value={form.date}
                                onChange={value => this.handleChangeForm(value, 'date')}
                            />
                        </div>
                        <div {...cls('field', '', 'col-lg-3')}>
                            <Select
                                placeholder='Выберите источник...'
                                label='Источник'
                                options={this.medias}
                                selected={this.state.selectedMedia}
                                onChange={selectedMedia => this.setState({selectedMedia})}
                            />
                        </div>
                    </div>

                    <div {...cls('row', '', 'row')}>
                        <div {...cls('col', '', 'col-lg-6')}>
                            <div {...cls('row', '', 'row')}>
                                <div {...cls('col', '', 'col-lg-12')}>
                                    <InputText
                                        label='URL'
                                        validateType='link'
                                        validateErrorMessage='Неверный адрес ссылки'
                                        value={form.url || ''}
                                        onChange={value => this.handleChangeForm(value, 'url')}
                                    />
                                </div>
                            </div>

                            <div {...cls('row', '', 'row')}>
                                <div {...cls('col', '', 'col-lg-4')}>
                                    <InputText
                                        label='Раздел 1'
                                        value={form.sectionFirst || ''}
                                        onChange={value => this.handleChangeForm(value, 'sectionFirst')}
                                    />
                                </div>
                                <div {...cls('col', '', 'col-lg-4')}>
                                    <InputText
                                        label='Раздел 2'
                                        value={form.sectionSecond || ''}
                                        onChange={value => this.handleChangeForm(value, 'sectionSecond')}
                                    />
                                </div>
                                <div {...cls('col', '', 'col-lg-4')}>
                                    <InputText
                                        label='Раздел 3'
                                        value={form.sectionThird || ''}
                                        onChange={value => this.handleChangeForm(value, 'sectionThird')}
                                    />
                                </div>
                            </div>

                            <div {...cls('row', '', 'row')}>
                                <div {...cls('col', '', 'col-lg-6')}>
                                    <InputText
                                        label='Автор'
                                        value={form.author || ''}
                                        onChange={value => this.handleChangeForm(value, 'author')}
                                    />
                                </div>
                                <div {...cls('col', '', 'col-lg-6')}>
                                    <InputText
                                        label='Город'
                                        value='' // {form.city}
                                    />
                                </div>
                            </div>

                            <div {...cls('row', '', 'row')}>
                                <div {...cls('col', '', 'col-lg-6')}>
                                    <InputText
                                        label='Область/край'
                                        value='' // {form.region}
                                    />
                                </div>
                                <div {...cls('col', '', 'col-lg-6')}>
                                    <InputText
                                        label='Федеральный округ'
                                        value='' // {form.federalDistrict}
                                    />
                                </div>
                            </div>

                            <div {...cls('row', '', 'row')}>
                                <div {...cls('col', '', 'col-lg-6')}>
                                    <InputText
                                        label='Код СМИ'
                                        value=''
                                    />
                                </div>
                                <div {...cls('col', '', 'col-lg-6')}>
                                    <InputText
                                        label='Вид СМИ'
                                        value=''
                                    />
                                </div>
                            </div>

                            <div {...cls('row', '', 'row')}>
                                <div {...cls('col', '', 'col-lg-6')}>
                                    <InputText
                                        label='Ноиер'
                                        value={form.number || ''}
                                        onChange={value => this.handleChangeForm(value, 'number')}
                                    />
                                </div>
                                <div {...cls('col', '', 'col-lg-6')}>
                                    <InputText
                                        label='Еще поле по СМИ'
                                        value=''
                                    />
                                </div>
                            </div>
                        </div>

                        <div {...cls('col', '', 'col-lg-6')}>
                            <TextArea
                                label='Аннотация'
                                value={form.annotation || ''}
                                onChange={value => this.handleChangeForm(value, 'annotation')}
                            />

                            <RichEditor
                                {...cls('field', 'textarea')}
                                label='Текст статьи'
                                content={form.text}
                                onChange={value => this.handleChangeForm(value, 'text')}
                            />
                        </div>
                    </div>
                </Form>

                {inProgress && <Loader/>}
            </ConfirmModal>
        );
    }
}
