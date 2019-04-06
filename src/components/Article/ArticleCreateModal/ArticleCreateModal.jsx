import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ConfirmModal from '../../Shared/ConfirmModal/ConfirmModal';

import './article-create-modal.scss';
import InputText from '../../Form/InputText/InputText';
import TextArea from '../../Form/TextArea/TextArea';
import InputDatePicker from '../../Form/InputDatePicker/InputDatePicker';

const classes = new Bem('article-create-modal');

export default class ArticleCreateModal extends Component {
    static propTypes = {
        article: PropTypes.object,
        onSubmit: PropTypes.func,
        onClose: PropTypes.func.isRequired
    };

    state = {
        form: {
            date: new Date()
        }
    };

    handleChangeForm = (value, option) => {
        this.setState(prev => prev.form[option] = value);
    };

    handleSubmit = () => {

    };

    render() {
        const {article, onClose} = this.props;
        const {form} = this.state;

        return (
            <ConfirmModal
                {...classes()}
                title={`${article ? article.title : 'Новая статья'}`}
                onClose={onClose}
                submitText='Обновить'
            >
                <div {...classes('row', '', 'row')}>
                    <div {...classes('field', '', 'col-lg-7')}>
                        <InputText
                            label='Название'
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
                        />
                    </div>
                </div>

                <div {...classes('row', '', 'row')}>
                    <div {...classes('col', '', 'col-lg-6')}>
                        <div {...classes('row', '', 'row')}>
                            <div {...classes('col', '', 'col-lg-12')}>
                                <InputText
                                    label='URL'
                                    validateType='link'
                                />
                            </div>
                        </div>

                        <div {...classes('row', '', 'row')}>
                            <div {...classes('col', '', 'col-lg-4')}>
                                <InputText
                                    label='Раздел 1'
                                />
                            </div>
                            <div {...classes('col', '', 'col-lg-4')}>
                                <InputText
                                    label='Раздел 2'
                                />
                            </div>
                            <div {...classes('col', '', 'col-lg-4')}>
                                <InputText
                                    label='Раздел 3'
                                />
                            </div>
                        </div>

                        <div {...classes('row', '', 'row')}>
                            <div {...classes('col', '', 'col-lg-6')}>
                                <InputText
                                    label='Автор'
                                />
                            </div>
                            <div {...classes('col', '', 'col-lg-6')}>
                                <InputText
                                    label='Город'
                                />
                            </div>
                        </div>

                        <div {...classes('row', '', 'row')}>
                            <div {...classes('col', '', 'col-lg-6')}>
                                <InputText
                                    label='Обласьт/край'
                                />
                            </div>
                            <div {...classes('col', '', 'col-lg-6')}>
                                <InputText
                                    label='Федеральный округ'
                                />
                            </div>
                        </div>

                        <div {...classes('row', '', 'row')}>
                            <div {...classes('col', '', 'col-lg-6')}>
                                <InputText
                                    label='Код СМИ'
                                />
                            </div>
                            <div {...classes('col', '', 'col-lg-6')}>
                                <InputText
                                    label='Вид СМИ'
                                />
                            </div>
                        </div>

                        <div {...classes('row', '', 'row')}>
                            <div {...classes('col', '', 'col-lg-6')}>
                                <InputText
                                    label='Ноиер'
                                />
                            </div>
                            <div {...classes('col', '', 'col-lg-6')}>
                                <InputText
                                    label='Еще поле по СМИ'
                                />
                            </div>
                        </div>
                    </div>

                    <div {...classes('col', '', 'col-lg-6')}>
                        <TextArea
                            label='Аннотация'
                        />

                        <TextArea
                            label='Текст статьи'
                        />
                    </div>
                </div>
            </ConfirmModal>
        );
    }
}
