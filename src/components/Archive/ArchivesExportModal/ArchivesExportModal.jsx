import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ConfirmModal from '../../Shared/ConfirmModal/ConfirmModal';
import Loader from '../../Shared/Loader/Loader';
import {ExportService} from '../../../services';
import TransferService from '../../../services/TransferService';
import RadioButton from '../../Form/RadioButton/RadioButton';
import './archives-export-modal.scss';
import Notification from '../../../helpers/Notification';
import {OperatedNotification} from "../../../helpers/Tools";
import InputText from "../../Form/InputText/InputText";

const cls = new Bem('archives-export-modal');

export default class ArticlesExportModal extends Component {
    static propTypes= {
        projectId: PropTypes.string.isRequired,
        archiveIds: PropTypes.array,
        onClose: PropTypes.func.isRequired,
        onUpdate: PropTypes.func.isRequired
    };

    state = {
        templates: [],
        selectedType: null,
        selectedTemplateId: null,
        filename: null,
        inProgress: true
    };

    componentDidMount() {
        TransferService.export
            .get('', {project: this.props.projectId})
            .then(response => {
                this.setState({
                    templates: _.groupBy(response.data, 'type'),
                    inProgress: false
                });
            })
            .catch(() => this.setState({inProgress: false}));
    }

    componentWillUnmount() {
        this.isMount = false;
    }

    handleSelectType = (selectedType) => {
        const {templates} = this.state;

        this.setState({
            selectedType,
            selectedTemplateId: templates[selectedType].length === 1 ? templates[selectedType][0].id  : null
        });
    };

    handleSelectTemplate = (selectedTemplateId) => {
        this.setState({selectedTemplateId});
    };

    handleSubmit = () => {
        const {archiveIds, projectId} = this.props;
        const {selectedTemplateId, filename} = this.state;

        if (selectedTemplateId) {
            this.setState({inProgress: true}, () => {
                ExportService.archives({
                    projectId,
                    archiveIds,
                    templateId: selectedTemplateId,
                    filename
                })
                    .then(({data}) => {
                        if (data.result === 'toQueue') {
                            Notification.toPanel({
                                title: 'Выгрузка архивов',
                                link: `/documents/${data.transactionId}`,
                                transactionId: data.transactionId,
                                message: 'Заказана выгрузка архивов'
                            });

                            OperatedNotification.success({
                                title: 'Экспорт архивов',
                                message: 'Документ успешно заказан',
                                submitButtonText: 'Перейти в документы',
                                timeOut: 10000,
                                onSubmit: () => window.open('/documents')
                            });
                        }

                        if (this.isMount) {
                            this.setState({inProgress: false}, () => {
                                this.props.onUpdate();
                                this.props.onClose();
                            });
                        }
                    })
                    .catch(() => {
                        if (this.isMount) this.setState({inProgress: false});
                    });
            });
        }
    };

    isMount = true;

    render() {
        const {onClose} = this.props;
        const {inProgress, filename, templates, selectedTemplateId, selectedType} = this.state;

        return (
            <ConfirmModal
                {...cls()}
                title='Выгрузка архивов'
                onClose={onClose}
                submitDisabled={!selectedTemplateId}
                submitText='Экспорт'
                onSubmit={this.handleSubmit}
            >

                <div {...cls('row', '', 'row')}>
                    <div {...cls('col', '', 'col-md-6')}>
                        <h3 {...cls('block-title')}>Выберите формат:</h3>

                        {Object.keys(templates).map(type =>
                            <RadioButton
                                name='type'
                                key={type}
                                {...cls('field')}
                                label={type}
                                checked={selectedType === type}
                                onChange={() => this.handleSelectType(type)}
                            />
                        )}
                    </div>
                    {selectedType && (
                        <div {...cls('col', '', 'col-md-6')}>
                            <h3 {...cls('block-title')}>Выберите шаблон:</h3>

                            {templates[selectedType].map(template => (
                                <RadioButton
                                    name='template'
                                    key={template.id}
                                    {...cls('field')}
                                    label={template.name}
                                    checked={selectedTemplateId === template.id}
                                    onChange={() => this.handleSelectTemplate(template.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {selectedTemplateId && (
                    <div {...cls('row', '', 'row')}>
                        <div {...cls('col', '', 'col-md-12')}>
                            <InputText
                                label='Имя файла'
                                value={filename || ''}
                                onChange={value => this.setState({filename: value})}
                            />
                        </div>
                    </div>
                )}

                {inProgress && <Loader/>}
            </ConfirmModal>
        );
    }
}
