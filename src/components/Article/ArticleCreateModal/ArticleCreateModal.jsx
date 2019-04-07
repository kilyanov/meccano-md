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
import { updateArticle, addArticle } from '../../../redux/actions/article';
import store from '../../../redux/store';
import Loader from '../../Shared/Loader/Loader';

const classes = new Bem('article-create-modal');

export default class ArticleCreateModal extends Component {
    static propTypes = {
        article: PropTypes.object,
        projectId: PropTypes.string.isRequired,
        onSubmit: PropTypes.func,
        onClose: PropTypes.func.isRequired
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

        this.setState({inProgress: true}, () => {
            ArticleService[isUpdate ? 'put' : 'post'](form, form.id).then((response) => {
                NotificationManager.success('Статья успешно добавлена в проект', 'Успех');

                if (isUpdate) store.dispatch(updateArticle(response.data));
                else store.dispatch(addArticle(response.data));

                this.setState({inProgress: false});
                this.props.onClose();
            }).catch(() => this.setState({inProgress: false}));
        });
    };

    render() {
        const {article, onClose} = this.props;
        const {form, inProgress} = this.state;

        return (
            <ConfirmModal
                {...classes()}
                title={`${article ? article.title : 'Новая статья'}`}
                onClose={onClose}
                onSubmit={() => this.form.submit()}
                submitText={article ? 'Обновить' : 'Добавить'}
            >
                <Form onSubmit={this.handleSubmit} ref={node => this.form = node}>
                    <div {...classes('row', '', 'row')}>
                        <div {...classes('field', '', 'col-lg-7')}>
                            <InputText
                                label='Название'
                                value={form.title}
                                onChange={value => this.handleChangeForm(value, 'title')}
                            />
                        </div>
                        <div {...classes('field', '', 'col-lg-2')}>
                            <InputDatePicker
                                label='Дата'
                                value={form.date}
                                onChange={value => this.handleChangeForm(value, 'date')}
                            />
                        </div>
                        <div {...classes('field', '', 'col-lg-3')}>
                            <InputText
                                label='Источник'
                                value={form.media || ''}
                                onChange={value => this.handleChangeForm(value, 'media')}
                            />
                        </div>
                    </div>

                    <div {...classes('row', '', 'row')}>
                        <div {...classes('col', '', 'col-lg-6')}>
                            <div {...classes('row', '', 'row')}>
                                <div {...classes('col', '', 'col-lg-12')}>
                                    <InputText
                                        label='URL'
                                        // validateType='link'
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
                                        label='Обласьт/край'
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
                        </div>

                        <div {...classes('col', '', 'col-lg-6')}>
                            <TextArea
                                label='Аннотация'
                                value={form.annotation}
                                onChange={value => this.handleChangeForm(value, 'annotation')}
                            />

                            <TextArea
                                {...classes('field', 'textarea')}
                                label='Текст статьи'
                                value={form.text}
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
