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
            format: '',
            settings: {
                a: false,
                b: false,
                c: false,
                d: false
            }
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
                            label='DOC'
                            checked={form.settings.a}
                            onChange={() => this.setState(prev => prev.form.settings.a = !prev.form.settings.a)}
                        />
                        <CheckBox
                            {...classes('field')}
                            label='PDF'
                            checked={form.settings.b}
                            onChange={() => this.setState(prev => prev.form.settings.b = !prev.form.settings.b)}
                        />
                        <CheckBox
                            {...classes('field')}
                            label='HTMl'
                            checked={form.settings.c}
                            onChange={() => this.setState(prev => prev.form.settings.c = !prev.form.settings.c)}
                        />
                        <CheckBox
                            {...classes('field')}
                            label='...'
                            checked={form.settings.d}
                            onChange={() => this.setState(prev => prev.form.settings.d = !prev.form.settings.d)}
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
