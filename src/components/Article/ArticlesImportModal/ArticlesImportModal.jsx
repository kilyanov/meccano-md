import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ConfirmModal from '../../Shared/ConfirmModal/ConfirmModal';
import './articles-import-modal.scss';
import RadioButton from '../../Form/RadioButton/RadioButton';
import InputFile from '../../Form/InputFile/InputFile';
import { ArticleService } from '../../../services';
import store from '../../../redux/store';
import { getArticlesByProject } from '../../../redux/actions/article/index';
import Loader from '../../Shared/Loader/Loader';

const classes = new Bem('articles-import-modal');

export default class ArticlesImportModal extends Component {
    static propTypes = {
        onClose: PropTypes.func.isRequired,
        projectId: PropTypes.string.isRequired
    };

    state = {
        form: {
            files: [],
            service: null
        },
        inProgress: false
    };

    handleSelectService = (isChecked, service) => {
        if (isChecked) {
            this.setState(prev => prev.form.service = service);
        }
    };

    handleChangeFiles = (files) => {
        this.setState(prev => prev.form.files = files);
    };

    handleSubmitForm = () => {
        const {form} = this.state;

        if (form.files) {
            this.setState({inProgress: true}, () => {
                form.files.forEach((file) => {
                    const formData = new FormData();

                    formData.append('doc', file);

                    ArticleService.upload(this.props.projectId, formData).then(() => {
                        store.dispatch(getArticlesByProject(this.props.projectId));
                        this.setState({inProgress: false});
                        this.props.onClose();
                    });
                });
            });
        }
    }

    render() {
        const {onClose} = this.props;
        const {form, inProgress} = this.state;

        return (
            <ConfirmModal
                {...classes()}
                title='Импорт статей'
                onClose={onClose}
                onSubmit={this.handleSubmitForm}
                submitText='Импорт'
                submitDisabled={!form.service && !form.files.length}
            >
                <div {...classes('row', '', 'row')}>
                    <div {...classes('col', '', 'col-md-4')}>
                        <h3 {...classes('section-title')}>Импорт из файла:</h3>

                        <InputFile
                            ref={node => this.inputFile = node}
                            onChange={this.handleChangeFiles}
                        />
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
