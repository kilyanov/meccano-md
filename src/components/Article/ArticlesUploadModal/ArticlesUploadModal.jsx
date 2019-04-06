import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ConfirmModal from '../../Shared/ConfirmModal/ConfirmModal';
import CheckBox from '../../Form/CheckBox/CheckBox';
import RadioButton from '../../Form/RadioButton/RadioButton';
import './articles-upload-modal.scss';

const classes = new Bem('articles-upload-modal');

export default class ArticlesUploadModal extends Component {
    static propTypes= {
        onClose: PropTypes.func.isRequired
    };

    state = {
        form: {
            format: ''
        }
    };

    handleChangeFormat = (isSelect, formatValue) => {
        this.setState(prev => prev.form.format = isSelect ? formatValue : '');
    };

    render() {
        const {onClose} = this.props;
        const {form} = this.state;

        return (
            <ConfirmModal
                {...classes()}
                title='Выгрузка статей'
                onClose={onClose}
            >
                <div {...classes('row', '', 'row')}>
                    <div {...classes('col', '', 'col-sm-6')}>
                        <h3 {...classes('block-title')}>Настройки:</h3>

                        <CheckBox
                            {...classes('field')}
                            label='Выгрузка по сортировке'
                        />
                        <CheckBox
                            {...classes('field')}
                            label='Включить HTML/XML'
                        />
                        <CheckBox
                            {...classes('field')}
                            label='Включить MS WORD'
                        />
                        <CheckBox
                            {...classes('field')}
                            label='Добавлять в конец'
                        />
                    </div>
                    <div {...classes('col', '', 'col-sm-6')}>
                        <h3 {...classes('block-title')}>Исходящие шаблоны:</h3>

                        <RadioButton
                            {...classes('field')}
                            name='format'
                            value='meccano-light'
                            label='Формат XML (MEL Meccano Light)'
                            onChange={this.handleChangeFormat}
                            checked={form.format === 'meccano-light'}
                        />
                        <RadioButton
                            {...classes('field')}
                            name='format'
                            value='meccano'
                            label='Формат XML (MEL Meccano)'
                            onChange={this.handleChangeFormat}
                            checked={form.format === 'meccano'}
                        />
                    </div>
                </div>
            </ConfirmModal>
        );
    }
}
