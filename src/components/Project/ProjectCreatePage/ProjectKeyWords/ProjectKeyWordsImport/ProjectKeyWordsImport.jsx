import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ConfirmModal from '../../../../Shared/ConfirmModal/ConfirmModal';
import InputFile from '../../../../Form/InputFile/InputFile';
import {ProjectService} from '../../../../../services';
import Loader from '../../../../Shared/Loader/Loader';

export default class ProjectKeyWordsImport extends Component {
    static propTypes = {
        projectId: PropTypes.string.isRequired,
        updateParent: PropTypes.func.isRequired,
        onClose: PropTypes.func.isRequired
    };

    state = {
        file: null,
        inProgress: false
    };

    handleChangeFile = (files) => {
        this.setState({file: files[0]});
    };

    handleSubmit = () => {
        const {file} = this.state;
        const form = new FormData();

        if (!file) return;

        form.append('file', file);

        this.setState({inProgress: true}, () => {
            ProjectService.wordSearch.import(form, this.props.projectId)
                .then(() => {
                    this.setState({inProgress: false});
                    this.props.updateParent();
                    this.props.onClose();
                })
                .catch(() => this.setState({inProgress: false}));
        });
    };

    render() {
        const {onClose} = this.props;
        const {file, inProgress} = this.state;

        return (
            <ConfirmModal
                title='Импорт ключевых слов'
                onClose={onClose}
                onSubmit={this.handleSubmit}
                submitDisabled={!file}
            >
                <p>
                    Выберите файл Excel с одним столбцом ключевых слов <br/>
                    Заголовок столбца должен быть именован как "words"
                </p>

                <InputFile
                    accept={['xls', 'xlsx']}
                    onChange={this.handleChangeFile}
                    required
                />

                {inProgress && <Loader />}
            </ConfirmModal>
        );
    }
}
