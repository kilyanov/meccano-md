import React, {Component} from 'react';
import PropTypes from 'prop-types';
import './articles-upload-modal.scss';
import ConfirmModal from '../../Shared/ConfirmModal/ConfirmModal';
import CheckBox from '../../Form/CheckBox/CheckBox';
import Loader from '../../Shared/Loader/Loader';
import {ExportService} from '../../../services';
import TransferService from '../../../services/TransferService';

const classes = new Bem('articles-upload-modal');

export default class ArticlesUploadModal extends Component {
    static propTypes= {
        projectId: PropTypes.string.isRequired,
        onClose: PropTypes.func.isRequired
    };

    state = {
        templates: [],
        selectedTemplates: [],
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

    handleSelectTemplate = (templateId) => {
        let {selectedTemplates} = this.state;

        if (selectedTemplates.includes(templateId)) {
            selectedTemplates = selectedTemplates.filter(id => id !== templateId);
        } else {
            selectedTemplates.push(templateId);
        }

        this.setState({selectedTemplates});
    };

    handleSubmit = () => {
        const {selectedTemplates} = this.state;

        if (selectedTemplates.length) {
            this.setState({inProgress: true}, () => {
                const link = document.createElement('a');

                link.href = ExportService.getLink(this.props.projectId);
                link.download = 'Выгрузка.xlsx';
                link.target = '_blank';

                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                this.setState({inProgress: false});
                this.props.onClose();
            });
        }
    };

    render() {
        const {onClose} = this.props;
        const {inProgress, templates, selectedTemplates} = this.state;

        return (
            <ConfirmModal
                {...classes()}
                title='Выгрузка статей'
                onClose={onClose}
                submitDisabled={!selectedTemplates.length}
                onSubmit={this.handleSubmit}
            >
                <h3 {...classes('block-title')}>Исходящие шаблоны:</h3>

                {templates.map(template =>
                    <CheckBox
                        key={template.value}
                        {...classes('field')}
                        label={template.name}
                        checked={selectedTemplates.includes(template.value)}
                        onChange={() => this.handleSelectTemplate(template.value)}
                    />
                )}

                {inProgress && <Loader/>}
            </ConfirmModal>
        );
    }
}
