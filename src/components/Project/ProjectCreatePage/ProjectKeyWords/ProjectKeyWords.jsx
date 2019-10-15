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
import ProjectKeyWordsImport from './ProjectKeyWordsImport/ProjectKeyWordsImport';
import CheckBox from '../../../Form/CheckBox/CheckBox';
import {Plural} from '../../../../helpers/Tools';

const cls = new Bem('project-key-words');

export default class ProjectKeyWords extends Component {
    static propTypes = {
        projectId: PropTypes.string.isRequired
    };

    state = {
        showCreateModal: false,
        showImportModal: false,
        selectedWord: null,
        selectedWords: [],
        wordValue: '',
        keyWords: [],
        inProgress: true,
        modalInProgress: false
    };

    componentDidMount() {
        this.getItems();
    }

    handleSelectWord = (keyWord) => {
        this.setState({
            selectedWord: keyWord,
            showCreateModal: true,
            wordValue: keyWord.name
        });
    };

    handleChangeSelectedWords = (keyWord) => {
        let selectedWords = [...this.state.selectedWords];

        if (selectedWords.includes(keyWord.id)) {
            selectedWords = selectedWords.filter(id => id !== keyWord.id);
        } else {
            selectedWords.push(keyWord.id);
        }

        this.setState({selectedWords});
    };

    handleSelectAllWords = () => {
        this.setState(({keyWords}) => ({
            selectedWords: keyWords.map(({id}) => id)
        }));
    };

    handleDeleteSelected = () => {
        const {selectedWords} = this.state;

        this.dialogModal.open({
            title: 'Удаление слов',
            content: `Вы уверены, что хотите удалить ${Plural(
                selectedWords.length, 
                `${selectedWords.length} `, 
                ['слово', 'слова', 'слов'])}?`,
            submitText: 'Удалить',
            danger: true
        }).then(() => {
            const {keyWords, selectedWords} = this.state;
            const isAllSelected = keyWords.length === selectedWords.length;

            ProjectService.wordSearch
                .delete(isAllSelected ? {all: true} : {wordIds: selectedWords}, this.props.projectId)
                .then(this.getItems)
                .catch(() => this.setState({inProgress: false}));
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
            danger: true
        }).then(() => {
            this.setState({inProgress: true}, () => {
                ProjectService.wordSearch.delete({wordIds: [keyWord.id]}, this.props.projectId).then(() => {
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

    getItems = () => {
        ProjectService.wordSearch
            .get({project: this.props.projectId})
            .then(response => {
                this.setState({
                    keyWords: response.data,
                    inProgress: false
                });
            }).catch(() => this.setState({inProgress: false}));
    };
    
    render() {
        const {projectId} = this.props;
        const {
            keyWords,
            showCreateModal,
            showImportModal,
            selectedWord,
            selectedWords,
            wordValue,
            inProgress,
            modalInProgress
        } = this.state;

        return (
            <div {...cls('', '', 'container')}>
                <h3>Ключевые слова</h3>

                <section {...cls('buttons-panel')}>
                    <div>
                        <InlineButton
                            {...cls('buttons-panel-item')}
                            ref={ref => this.addButtonRef = ref}
                            onClick={() => this.setState({showCreateModal: true})}
                        >+ Добавить слово</InlineButton>

                        <InlineButton
                            onClick={() => this.setState({showImportModal: true})}
                        >Импорт слов</InlineButton>
                    </div>

                    {!!selectedWords.length && (
                        <div {...cls('buttons-panel-item')}>
                            <span {...cls('buttons-panel-item')}>
                                {Plural(
                                    selectedWords.length,
                                    '',
                                    ['Выбрано', 'Выбраны', 'Выбраны']
                                )}
                                {Plural(
                                    selectedWords.length,
                                    ` ${selectedWords.length} `,
                                    ['слово', 'слова', 'слов']
                                )}
                            </span>

                            {selectedWords.length < keyWords.length && (
                                <InlineButton
                                    {...cls('buttons-panel-item')}
                                    onClick={this.handleSelectAllWords}
                                >Выбрать все слова</InlineButton>
                            )}

                            <InlineButton
                                {...cls('buttons-panel-item')}
                                onClick={() => this.setState({selectedWords: []})}
                            >Снять выделение</InlineButton>

                            <InlineButton
                                {...cls('buttons-panel-item')}
                                onClick={this.handleDeleteSelected}
                                danger
                            >Удалить</InlineButton>
                        </div>
                    )}
                </section>

                <ul {...cls('list')}>
                    {keyWords.map((keyWord, key) => (
                        <li {...cls('list-item')} key={key}>
                            <CheckBox
                                label={keyWord.name}
                                checked={selectedWords.includes(keyWord.id)}
                                onChange={() => this.handleChangeSelectedWords(keyWord)}
                            />

                            <div {...cls('list-item-buttons')}>
                                <button
                                    {...cls('list-item-button', 'edit')}
                                    onClick={() => this.handleSelectWord(keyWord)}
                                    title='Редактировать'
                                >
                                    <PencilIcon {...cls('list-item-icon', 'pencil')}/>
                                </button>
                                <button
                                    {...cls('list-item-button', 'remove')}
                                    onClick={() => this.handleDeleteWord(keyWord)}
                                    title='Удалить'
                                >
                                    <TrashIcon {...cls('list-item-icon', 'trash')}/>
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>

                {showCreateModal && (
                    <ConfirmModal
                        {...cls('modal')}
                        title={selectedWord ? 'Обновление слова' : 'Добавление слова'}
                        onClose={this.handleCloseCreateModal}
                        submitText={selectedWord ? 'Обновить' : 'Добавить'}
                        onSubmit={this.handleSubmit}
                        width='small'
                    >
                        <InputText
                            autoFocus
                            {...cls('field')}
                            label='Название'
                            value={wordValue}
                            onChange={this.handleChangeInput}
                            onEnter={this.handleSubmit}
                        />

                        {modalInProgress && <Loader/>}
                    </ConfirmModal>
                )}

                {showImportModal && (
                    <ProjectKeyWordsImport
                        projectId={projectId}
                        updateParent={this.getItems}
                        onClose={() => this.setState({showImportModal: false})}
                    />
                )}

                <PromiseDialogModal ref={ref => this.dialogModal = ref} />

                {inProgress && <Loader fixed/>}
            </div>
        );
    }
}
