import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ConfirmModal from '../../Shared/ConfirmModal/ConfirmModal';
import CheckBox from '../../Form/CheckBox/CheckBox';
import RadioButton from '../../Form/RadioButton/RadioButton';
import './articles-upload-modal.scss';
import Loader from '../../Shared/Loader/Loader';
import {ExportService} from '../../../services';

const classes = new Bem('articles-upload-modal');

export default class ArticlesUploadModal extends Component {
    static propTypes= {
        projectId: PropTypes.string.isRequired,
        onClose: PropTypes.func.isRequired
    };

    state = {
        form: {
            format: '',
            settings: {
                excel: false,
                b: false,
                c: false,
                d: false
            }
        },
        inProgress: false
    };

    handleChangeFormat = (isSelect, formatValue) => {
        this.setState(prev => prev.form.format = isSelect ? formatValue : '');
    };

    handleChangeSettings = (type, value) => {
        this.setState(prev => prev.form.settings[type] = value);
    };

    handleSubmit = () => {
        const {settings} = this.state.form;
        const selectedFormats = Object.keys(settings).filter(key => settings[key]);

        if (selectedFormats.length) {
            this.setState({inProgress: true}, () => {
                ExportService.xlsx(this.props.projectId).then(response => {
                    // var disposition = request.getResponseHeader('content-disposition');
                    // var matches = /"([^"]*)"/.exec(disposition);
                    // var filename = (matches != null && matches[1] ? matches[1] : 'file.pdf');

                    const blob = new Blob([response.data], { type: 'appliкоторыcation/xlsx' });
                    const link = document.createElement('a');

                    link.href = window.URL.createObjectURL(blob);
                    link.download = 'Выгрузка.xlsx';

                    document.body.appendChild(link);

                    link.click();

                    document.body.removeChild(link);
                    this.setState({inProgress: false});
                    this.props.onClose();
                }).catch(e => console.log(e));
            });
        }
    };

    render() {
        const {onClose} = this.props;
        const {inProgress, form: {format, settings}} = this.state;
        const selectedFormats = Object.keys(settings).filter(key => settings[key]);

        return (
            <ConfirmModal
                {...classes()}
                title='Выгрузка статей'
                onClose={onClose}
                submitDisabled={!selectedFormats.length}
                onSubmit={this.handleSubmit}
            >
                <div {...classes('row', '', 'row')}>
                    <div {...classes('col', '', 'col-sm-6')}>
                        <h3 {...classes('block-title')}>Настройки:</h3>

                        <CheckBox
                            {...classes('field')}
                            label='XLSX'
                            checked={settings.excel}
                            onChange={() => this.handleChangeSettings('excel', !settings.excel)}
                        />
                        <CheckBox
                            {...classes('field')}
                            label='PDF'
                            disabled
                            checked={settings.b}
                            onChange={() => this.setState(prev => prev.form.settings.b = !prev.form.settings.b)}
                        />
                        <CheckBox
                            {...classes('field')}
                            label='HTMl'
                            disabled
                            checked={settings.c}
                            onChange={() => this.setState(prev => prev.form.settings.c = !prev.form.settings.c)}
                        />
                    </div>
                    <div {...classes('col', '', 'col-sm-6')}>
                        <h3 {...classes('block-title')}>Исходящие шаблоны:</h3>

                        <RadioButton
                            {...classes('field')}
                            name='format'
                            disabled
                            value='meccano-light'
                            label='Формат XML (MEL Meccano Light)'
                            onChange={this.handleChangeFormat}
                            checked={format === 'meccano-light'}
                        />
                        <RadioButton
                            {...classes('field')}
                            name='format'
                            disabled
                            value='meccano'
                            label='Формат XML (MEL Meccano)'
                            onChange={this.handleChangeFormat}
                            checked={format === 'meccano'}
                        />
                    </div>
                </div>

                {inProgress && <Loader/>}
            </ConfirmModal>
        );
    }
}
