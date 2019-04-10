import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ConfirmModal from '../../Shared/ConfirmModal/ConfirmModal';
import './articles-import-modal.scss';
import RadioButton from '../../Form/RadioButton/RadioButton';
import InputFile from '../../Form/InputFile/InputFile';
import { ArticleService } from '../../../services';
import store from '../../../redux/store';
import { getArticlesByProject } from '../../../redux/actions/article/index';

const classes = new Bem('articles-import-modal');

export default class ArticlesImportModal extends Component {
    static propTypes = {
        onClose: PropTypes.func.isRequired,
        projectId: PropTypes.string.isRequired
    };

    state = {
        form: {
            files: null,
            service: null
        }
    };

    handleSelectService = (isChecked, service) => {
        if (isChecked) {
            this.setState(prev => prev.form.service = service);
        }
    };

    handleChangeFiles = (files) => {
        files.forEach((file) => {
            const form = new FormData();

            form.append('doc', file);

            ArticleService.upload(this.props.projectId, form).then(() => {
                store.dispatch(getArticlesByProject(this.props.projectId));
            });
        });
    };

    handleSubmitForm = () => {
        const {form} = this.state;

        if (form.files) {
            this.inputFile.upload();
            this.setState({inProgress: true});
        }
    }

    render() {
        const {onClose} = this.props;
        const {form} = this.state;

        return (
            <ConfirmModal
                {...classes()}
                title='Импорт статей'
                onClose={onClose}
                onSubmit={this.handleSubmitForm}
                submitText='Импорт'
                submitDisabled={!form.service && !form.files}
            >
                <div {...classes('row', '', 'row')}>
                    <div {...classes('col', '', 'col-md-4')}>
                        <h3 {...classes('section-title')}>Импорт из файла:</h3>

                        <InputFile
                            ref={node => this.inputFile = node}
                            onChange={this.handleChangeFiles}
                        />
                    </div>
                    <div {...classes('col', '', 'col-md-8')}>
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
            </ConfirmModal>
        );
    }
}
