import React, {Component} from 'react';
import PropTypes from 'prop-types';
import './articles-upload-modal.scss';
import ConfirmModal from '../../Shared/ConfirmModal/ConfirmModal';
import Loader from '../../Shared/Loader/Loader';
import {ExportService} from '../../../services';
import TransferService from '../../../services/TransferService';
import RadioButton from '../../Form/RadioButton/RadioButton';

const classes = new Bem('articles-upload-modal');

export default class ArticlesUploadModal extends Component {
    static propTypes= {
        projectId: PropTypes.string.isRequired,
        onClose: PropTypes.func.isRequired
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

    handleSelectType = (selectedType) => {
        this.setState({selectedType, selectedTemplateId: null});
    };

    handleSelectTemplate = (selectedTemplateId) => {
        this.setState({selectedTemplateId});
    };

    handleSubmit = () => {
        const {selectedTemplateId} = this.state;

        if (selectedTemplateId) {
            this.setState({inProgress: true}, () => {
                const link = document.createElement('a');

                link.href = ExportService.getLink(this.props.projectId, selectedTemplateId);
                link.download = 'Выгрузка.xlsx';
                link.target = '_blank';

                document.body.appendChild(link);

                link.click();

                document.body.removeChild(link);

                this.setState({inProgress: false}, this.props.onClose);
            });
        }
    };

    render() {
        const {onClose} = this.props;
        const {inProgress, templates, selectedTemplateId, selectedType} = this.state;

        return (
            <ConfirmModal
                {...classes()}
                title='Выгрузка статей'
                onClose={onClose}
                submitDisabled={!selectedTemplateId}
                onSubmit={this.handleSubmit}
            >
                <div {...classes('row', '', 'row')}>
                    <div {...classes('col', '', 'col-md-6')}>
                        <h3 {...classes('block-title')}>Выберите формат:</h3>

                        {Object.keys(templates).map(type =>
                            <RadioButton
                                name='type'
                                key={type}
                                {...classes('field')}
                                label={type}
                                checked={selectedType === type}
                                onChange={() => this.handleSelectType(type)}
                            />
                        )}
                    </div>
                    {selectedType && (
                        <div {...classes('col', '', 'col-md-6')}>
                            <h3 {...classes('block-title')}>Выберите шаблон:</h3>

                            {templates[selectedType].map(template => (
                                <RadioButton
                                    name='template'
                                    key={template.id}
                                    {...classes('field')}
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
