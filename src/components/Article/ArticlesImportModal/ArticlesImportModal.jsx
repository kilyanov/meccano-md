import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ConfirmModal from '../../Shared/ConfirmModal/ConfirmModal';
import './articles-import-modal.scss';
import RadioButton from '../../Form/RadioButton/RadioButton';
import InputFile from '../../Form/InputFile/InputFile';
import {ProjectService} from '../../../services';
import Loader from '../../Shared/Loader/Loader';
import TransferService from '../../../services/TransferService';
import {OperatedNotification, QueueManager} from '../../../helpers/Tools';
import {NotificationManager} from 'react-notifications';

const classes = new Bem('articles-import-modal');

export default class ArticlesImportModal extends Component {
    static propTypes = {
        onClose: PropTypes.func.isRequired,
        projectId: PropTypes.string.isRequired
    };

    state = {
        form: {
            files: [],
            typeId: null,
            service: null
        },
        types: [],
        selectedTypeId: null,
        inProgress: true
    };

    componentDidMount() {
        TransferService.import
            .get()
            .then(response => {
                this.setState({
                    types: response.data,
                    inProgress: false
                });
            })
            .catch(() => this.setState({inProgress: false}));
    }

    componentWillUnmount() {
        this.isMounted = false;
    }

    handleSelectService = (isChecked, service) => {
        if (isChecked) {
            this.setState(prev => prev.form.service = service);
        }
    };

    handleChangeFiles = (files) => {
        this.setState(prev => prev.form.files = files);
    };

    handleChangeType = (typeId) => {
        this.setState(prev => prev.form.typeId = typeId);
    };

    handleSubmitForm = () => {
        const {form} = this.state;
        const loadingMessage = {id: 'import', text: 'Идет импорт статей...'};

        if (form.files) {
            this.setState({inProgress: true}, () => {
                form.files.forEach((file) => {
                    const formData = new FormData();

                    formData.append('file', file);
                    formData.append('import', form.typeId);

                    setTimeout(() => {
                        if (this.state.inProgress) {
                            QueueManager.push(loadingMessage);
                            this.props.onClose();
                        }
                    }, 2000);

                    ProjectService.importArticles(this.props.projectId, formData).then(() => {
                        QueueManager.remove(loadingMessage.id);

                        if (this.isMounted) {
                            NotificationManager.success('Импорт успешно завершен', 'Импорт статей');
                            this.setState({inProgress: false});
                        } else {
                            OperatedNotification.success({
                                title: 'Импорт статей',
                                message: 'Импорт успешно завершен',
                                submitButtonText: 'Перейти к проекту →',
                                cancelButtonText: 'Закрыть',
                                onSubmit: () => this.context.router.history.push(`/project/${this.props.projectId}`)
                            });
                        }

                        this.props.onSubmit();
                        this.props.onClose();
                    }).catch(() => {
                        QueueManager.remove(loadingMessage.id);
                        if (this.isMounted) this.setState({inProgress: false});
                    });
                });
            });
        }
    };

    isMounted = true;

    render() {
        const {onClose} = this.props;
        const {form, types, inProgress} = this.state;
        const selectedType = types.find(({id}) => id === form.typeId) || {};

        return (
            <ConfirmModal
                {...classes()}
                title='Импорт статей'
                onClose={onClose}
                onSubmit={this.handleSubmitForm}
                submitText='Импорт'
                submitDisabled={!form.service && (!form.files.length || !form.typeId)}
            >
                <div {...classes('row', '', 'row')}>
                    <div {...classes('col', '', 'col-md-4')}>
                        <h3 {...classes('section-title')}>Импорт из файла:</h3>

                        {types.map(type => (
                            <RadioButton
                                {...classes('radio-button')}
                                key={type.id}
                                label={type.name}
                                name='type'
                                value={type.id}
                                checked={type.id === form.typeId}
                                onChange={() => this.handleChangeType(type.id)}
                            />
                        ))}

                        <div style={{visibility: form.typeId && selectedType ? 'visible' : 'hidden'}}>
                            <InputFile
                                {...classes('input-file')}
                                onChange={this.handleChangeFiles}
                                accept={selectedType.fileTypes}
                            />
                        </div>
                    </div>
                    <div {...classes('col', '', ['col-md-8', 'd-none'])}>
                        <h3 {...classes('section-title')}>Импорт из сервиса:</h3>

                        <RadioButton
                            label='YoScan'
                            name='service'
                            value='yo-scan'
                            checked={form.service === 'yo-scan'}
                            onChange={this.handleSelectService}
                        />
                    </div>
                </div>

                {inProgress && <Loader/>}
            </ConfirmModal>
        );
    }
}
