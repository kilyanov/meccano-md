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
        selectedTemplateId: null,
        inProgress: true
    };

    componentDidMount() {
        TransferService.export
            .get()
            .then(response => {
                this.setState({
                    templates: response.data.map(({id, name}) => ({name, value: id})),
                    inProgress: false
                });
            })
            .catch(() => this.setState({inProgress: false}));
    }

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
        const {inProgress, templates, selectedTemplateId} = this.state;

        return (
            <ConfirmModal
                {...classes()}
                title='Выгрузка статей'
                onClose={onClose}
                submitDisabled={!selectedTemplateId}
                onSubmit={this.handleSubmit}
            >
                <h3 {...classes('block-title')}>Исходящие шаблоны:</h3>

                {templates.map(template =>
                    <RadioButton
                        name='template'
                        key={template.value}
                        {...classes('field')}
                        label={template.name}
                        checked={selectedTemplateId === template.value}
                        onChange={() => this.handleSelectTemplate(template.value)}
                    />
                )}

                {inProgress && <Loader/>}
            </ConfirmModal>
        );
    }
}
