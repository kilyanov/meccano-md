import React, {Component} from 'react';
import PropTypes from 'prop-types';
import InlineButton from '../../../Shared/InlineButton/InlineButton';
import InputText from '../../../Form/InputText/InputText';
import ConfirmModal from '../../../Shared/ConfirmModal/ConfirmModal';
import PencilIcon from '../../../Shared/SvgIcons/PencilIcon';
import TrashIcon from '../../../Shared/SvgIcons/TrashIcon';
import {ProjectService} from '../../../../services';
import PromiseDialogModal from '../../../Shared/PromiseDialogModal/PromiseDialogModal';
import Loader from '../../../Shared/Loader/Loader';
import './project-key-words.scss';

const classes = new Bem('project-key-words');

export default class ProjectKeyWords extends Component {
    static propTypes = {
        projectId: PropTypes.string.isRequired
    };

    state = {
        showCreateModal: false,
        selectedWord: null,
        wordValue: '',
        keyWords: [],
        inProgress: true,
        modalInProgress: false
    };

    componentDidMount() {
        ProjectService.wordSearch
            .get({project: this.props.projectId})
            .then(response => {
                this.setState({
                    keyWords: response.data,
                    inProgress: false
                });
            }).catch(() => this.setState({inProgress: false}));
    }

    handleSelectWord = (keyWord) => {
        this.setState({
            selectedWord: keyWord,
            showCreateModal: true,
            wordValue: keyWord.name
        });
    };

    handleCloseCreateModal = () => {
        this.setState({
            selectedWord: null,
            showCreateModal: false,
            wordValue: ''
        });
    };

    handleChangeInput = (value) => {
        this.setState({wordValue: value});
    };

    handleDeleteWord = (keyWord) => {
        this.dialogModal.open({
            title: 'Удаление ключевого слова',
            content: `Вы уверены, что хотите удалить ключевое слово "${keyWord.name}"?`,
            submitText: 'Удалить',
            style: 'danger'
        }).then(() => {
            this.setState({inProgress: true}, () => {
                ProjectService.wordSearch.delete(keyWord.id).then(() => {
                    const {keyWords} = this.state;

                    this.setState({
                        keyWords: keyWords.filter(({id}) => id !== keyWord.id),
                        inProgress: false
                    });
                }).catch(() => this.setState({inProgress: false}));
            });
        });
    };

    handleSubmit = () => {
        const {selectedWord, wordValue} = this.state;
        const method = selectedWord ? 'update' : 'create';

        let form = {project_id: this.props.projectId};

        if (selectedWord) {
            form = {...form, ...selectedWord};
            form.name = wordValue;
            delete form.id;
        } else {
            form.name = wordValue;
        }

        this.setState({modalInProgress: true}, () => {
            ProjectService.wordSearch[method](form, _.get(selectedWord, 'id')).then(response => {
                let {keyWords} = this.state;

                if (method === 'update') {
                    keyWords = keyWords.map(word => word.id === response.data.id ? response.data : word);
                } else keyWords.push(response.data);

                this.setState({
                    keyWords,
                    selectedWord: null,
                    showCreateModal: false,
                    modalInProgress: false,
                    wordValue: ''
                }, () => this.addButtonRef.focus());
            }).catch(() => this.setState({modalInProgress: false}));
        });
    };
    
    render() {
        const {
            keyWords,
            showCreateModal,
            selectedWord,
            wordValue,
            inProgress,
            modalInProgress
        } = this.state;

        return (
            <div {...classes('', '', 'container')}>
                <h3>Ключевые слова</h3>

                <InlineButton
                    ref={ref => this.addButtonRef = ref}
                    onClick={() => this.setState({showCreateModal: true})}
                >+ Добавить слово</InlineButton>

                <ul {...classes('list')}>
                    {keyWords.map((keyWord, key) => (
                        <li {...classes('list-item')} key={key}>
                            <span {...classes('list-item-name')}>{keyWord.name}</span>

                            <div {...classes('list-item-buttons')}>
                                <button
                                    {...classes('list-item-button', 'edit')}
                                    onClick={() => this.handleSelectWord(keyWord)}
                                    title='Редактировать'
                                >
                                    <PencilIcon {...classes('list-item-icon', 'pencil')}/>
                                </button>
                                <button
                                    {...classes('list-item-button', 'remove')}
                                    onClick={() => this.handleDeleteWord(keyWord)}
                                    title='Удалить'
                                >
                                    <TrashIcon {...classes('list-item-icon', 'trash')}/>
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>

                {showCreateModal && (
                    <ConfirmModal
                        {...classes('modal')}
                        onClose={this.handleCloseCreateModal}
                        submitText={selectedWord ? 'Обновить' : 'Добавить'}
                        onSubmit={this.handleSubmit}
                        width='small'
                    >
                        <InputText
                            autoFocus
                            {...classes('field')}
                            label='Название'
                            value={wordValue}
                            onChange={this.handleChangeInput}
                            onEnter={this.handleSubmit}
                        />

                        {modalInProgress && <Loader/>}
                    </ConfirmModal>
                )}

                <PromiseDialogModal ref={ref => this.dialogModal = ref} />

                {inProgress && <Loader fixed/>}
            </div>
        );
    }
}
