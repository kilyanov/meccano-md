import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ConfirmModal from '../../Shared/ConfirmModal/ConfirmModal';
import Loader from '../../Shared/Loader/Loader';
import {ExportService} from '../../../services';
import TransferService from '../../../services/TransferService';
import RadioButton from '../../Form/RadioButton/RadioButton';
import './articles-export-modal.scss';
import Notification from '../../../helpers/Notification';
import {NotificationManager} from 'react-notifications';

const cls = new Bem('articles-export-modal');

export default class ArticlesExportModal extends Component {
    static propTypes= {
        projectId: PropTypes.string.isRequired,
        selectedArticleIds: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
        onClose: PropTypes.func.isRequired,
        onUpdateParent: PropTypes.func.isRequired
    };

    state = {
        templates: [],
        selectedType: null,
        selectedTemplateId: null,
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
        const {projectId, selectedArticleIds} = this.props;
        const {selectedTemplateId} = this.state;

        if (selectedTemplateId) {
            this.setState({inProgress: true}, () => {
                const articleIds = _.isBoolean(selectedArticleIds) ? null :
                    selectedArticleIds.length ? selectedArticleIds : null;

                ExportService
                    .articles(
                        projectId,
                        selectedTemplateId,
                        articleIds
                    )
                    .then(({data}) => {
                        if (data.result === 'toQueue') {
                            Notification.toPanel({
                                title: 'Выгрузка статей',
                                link: `/documents/${data.transactionId}`,
                                transactionId: data.transactionId,
                                message: 'Заказаана выгрузка статей'
                            });

                            NotificationManager.success('Документ успешно заказан', 'Экспорт статей');
                        }

                        if (this.isMount) this.setState({inProgress: false}, () => {
                            this.props.onUpdateParent();
                            this.props.onClose();
                        });
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
        const {inProgress, templates, selectedTemplateId, selectedType} = this.state;

        return (
            <ConfirmModal
                {...cls()}
                title='Выгрузка статей'
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

                {inProgress && <Loader/>}
            </ConfirmModal>
        );
    }
}
