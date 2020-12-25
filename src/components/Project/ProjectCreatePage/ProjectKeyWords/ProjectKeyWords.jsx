import React, {Component} from 'react';
import PropTypes from 'prop-types';
import InlineButton from '../../../Shared/InlineButton/InlineButton';
import InputText from '../../../Form/InputText/InputText';
import ConfirmModal from '../../../Shared/ConfirmModal/ConfirmModal';
import PencilIcon from '../../../Shared/SvgIcons/PencilIcon';
import TrashIcon from '../../../Shared/SvgIcons/TrashIcon';
import ArrowIcon from '../../../Shared/SvgIcons/ArrowIcon';
import {ProjectService} from '../../../../services';
import PromiseDialogModal from '../../../Shared/PromiseDialogModal/PromiseDialogModal';
import Loader from '../../../Shared/Loader/Loader';
import './project-key-words.scss';
import ProjectKeyWordsImport from './ProjectKeyWordsImport/ProjectKeyWordsImport';
import CheckBox from '../../../Form/CheckBox/CheckBox';
import {Plural} from '../../../../helpers/Tools';
import Sortable from 'react-sortablejs';
import SearchFilter from '../../../Shared/SearchFilter/SearchFilter';

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
        wordPosition: '',
        keyWords: [],
        pagination: {
            page: 1
        },
        inProgress: true,
        modalInProgress: false,
        isEndScroll: false,
        search: ''
    };

    componentDidMount() {
        this.getItems();
    }

    handleSelectWord = (keyWord) => {
        this.setState({
            selectedWord: keyWord,
            showCreateModal: true,
            wordValue: keyWord.name,
            wordPosition: keyWord.position
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
        const {keyWords, selectedWords} = this.state;

        this.dialogModal.open({
            title: 'Удаление слов',
            content: `Вы уверены, что хотите удалить ${Plural(
                selectedWords.length, 
                `${selectedWords.length} `, 
                ['слово', 'слова', 'слов'])}?`,
            submitText: 'Удалить',
            danger: true
        }).then(() => {
            const isAllSelected = keyWords.length === selectedWords.length;

            ProjectService.wordSearch
                .delete(isAllSelected ? {all: true} : {wordIds: selectedWords}, this.props.projectId)
                .then(() => {
                    this.setState({
                        selectedWords: [],
                        pagination: { page: 1 }
                    }, () => this.getItems());
                })
                .catch(() => this.setState({inProgress: false}));
        });
    };

    handleCloseCreateModal = () => {
        this.setState({
            selectedWord: null,
            showCreateModal: false,
            wordValue: '',
            wordPosition: ''
        });
    };

    handleChangeInput = (value) => {
        this.setState({wordValue: value});
    };

    handleChangePositionInput = (value) => {
        this.setState({wordPosition: value});
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
        const {selectedWord, wordValue, wordPosition} = this.state;
        const method = selectedWord ? 'update' : 'create';

        let form = {project_id: this.props.projectId};

        if (selectedWord) {
            form = { ...selectedWord, ...form };
            form.name = wordValue;
            form.position = +wordPosition;
            delete form.id;
        } else {
            form.name = wordValue;
            form.position = +wordPosition;
        }

        this.setState({modalInProgress: true}, () => {
            ProjectService.wordSearch[method](form, this.props.projectId, _.get(selectedWord, 'id'))
                .then(response => {
                    let {keyWords} = this.state;

                    if (method === 'update') {
                        keyWords = keyWords.map(word => word.id === response.data.id ? response.data : word);
                    } else keyWords.unshift(response.data);

                    this.setState({
                        keyWords,
                        selectedWord: null,
                        showCreateModal: false,
                        modalInProgress: false,
                        wordValue: '',
                        wordPosition: '',
                        pagination: { page: 1 }
                    }, () => {
                        this.addButtonRef.focus();
                        this.getItems();
                    });
                })
                .catch(() => this.setState({modalInProgress: false}));
        });
    };

    handleEndSort = (sortedKeys, it, e) => {
        const sortedKeyWords = sortedKeys.map(key => {
            return this.state.keyWords.find((wordId) => wordId.id === key);
        });

        this.setState({
            keyWords: sortedKeyWords
        }, () => {
            const movedWordId = e.item.dataset.id;
            const movedWordIndex = this.state.keyWords.findIndex(el => el.id === movedWordId);
            const nextWord = this.state.keyWords[movedWordIndex + 1] || null;

            if (nextWord) {
                ProjectService.wordSearch
                    .get(null, this.props.projectId, nextWord.id)
                    .then(({data}) => {
                        console.log(`Перемещено на место слова ${data.name} с позицией ${data.position}`);
                        this.updateWordPosition(movedWordId, data.position);
                    });
            } else {
                this.updateWordPosition(movedWordId, -1);
            }
        });
    };

    handleEndReached = () => {
        const { pagination } = this.state;

        if (pagination.page < pagination.pageCount) {
            this.setState(state => state.pagination.page++, () => this.getItems(true));
        }
    }

    handleEndScroll = () => {
        const { scrollHeight, scrollTop, clientHeight } = this.listRef.node;
        const endScrollState = scrollHeight - scrollTop - 64 * 3 <= clientHeight;
        if (this.state.isEndScroll !== endScrollState) {
            this.setState(
                {isEndScroll: endScrollState},
                () => {
                    if (endScrollState) this.handleEndReached();
                }
            );
        }
    };

    handleSearch = () => {
        this.getItems();
    }

    getItems = (isPagintaion) => {
        const {pagination, search, keyWords} = this.state;

        ProjectService.wordSearch
            .get({
                'page': pagination.page,
                'per-page': 50,
                'sort': 'position',
                'query[name]': search,
                'query[project_id]': this.props.projectId
            }, this.props.projectId)
            .then(response => {
                const responsePagination = {
                    pageCount: +_.get(response.headers, 'x-pagination-page-count'),
                    page: +_.get(response.headers, 'x-pagination-current-page'),
                    perPage: +_.get(response.headers, 'x-pagination-per-page'),
                    totalCount: +_.get(response.headers, 'x-pagination-total-count')
                };

                this.setState({
                    keyWords: isPagintaion ? keyWords.concat(response.data) : response.data,
                    pagination: responsePagination,
                    inProgress: false
                });
            }).catch(() => this.setState({inProgress: false}));
    };

    updateWordPosition = (wordId, position, isGetItems) => {
        ProjectService.wordSearch
            .update({ position }, this.props.projectId, wordId)
            .then(({ data }) => {
                if (isGetItems) {
                    this.getItems();
                }

                console.log(`Записал слову ${data.name} позицию ${data.position}`);
            })
            .catch((error) => console.log(error));
    };

    updateWordPositionToStart = (keyWord, index) => {
        const keyWords = [...this.state.keyWords];
        keyWords.splice(index, 1);
        keyWords.unshift(keyWord);
        this.setState({ keyWords });
        this.updateWordPosition(keyWord.id, 1);
    }

    updateWordPositionToEnd = (keyWord, index) => {
        const { page, pageCount } = this.state.pagintaion;

        if (page < pageCount) {
            this.updateWordPosition(keyWord.id, -1, true);
        } else {
            const keyWords = [...this.state.keyWords];
            keyWords.splice(index, 1);
            keyWords.push(keyWord);
            this.setState({ keyWords });
            this.updateWordPosition(keyWord.id, -1, false);
        }
    }

    renderItem = (index) => {
        const { selectedWords } = this.state;
        const keyWord = this.state.keyWords[index];

        return (
            <div {...cls('list-item')}>
                <CheckBox
                    label={keyWord.name}
                    checked={selectedWords.includes(keyWord.id)}
                    onChange={() => this.handleChangeSelectedWords(keyWord)}
                />

                <div {...cls('list-item-buttons')}>
                    <button
                        {...cls('list-item-button', 'move-start')}
                        onClick={() => this.updateWordPositionToStart(keyWord, index)}
                        title='В начало списка'
                    >
                        <ArrowIcon {...cls('list-item-icon', 'arrow-to-start')}/>
                    </button>
                    <button
                        {...cls('list-item-button', 'move-end')}
                        onClick={() => this.updateWordPositionToEnd(keyWord, index)}
                        title='В конец списка'
                    >
                        <ArrowIcon {...cls('list-item-icon', 'arrow-to-end')}/>
                    </button>
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
            </div>
        );
    }

    render() {
        const {projectId} = this.props;
        const {
            keyWords,
            showCreateModal,
            showImportModal,
            selectedWord,
            selectedWords,
            wordValue,
            wordPosition,
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

                    <SearchFilter
                        {...cls('filter-item')}
                        placeholder='Найти'
                        value={this.state.search}
                        onChange={e => this.setState({ search: e })}
                        onSearch={this.handleSearch}
                    />

                </section>

                <Sortable
                    {...cls('list')}
                    options={{ animation: 150 }}
                    ref={ref => this.listRef = ref}
                    onChange={this.handleEndSort}
                    onScroll={this.handleEndScroll}
                >
                    {this.state.keyWords.map((keyWord, index) => (
                        <div
                            data-id={keyWord.id}
                            key={keyWord.id}
                        >
                            {this.renderItem(index)}
                        </div>
                    ))}
                </Sortable>

                {/* <ul {...cls('list')}>
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
                </ul> */}

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

                        <InputText
                            {...cls('field')}
                            label='Позиция'
                            value={wordPosition}
                            onChange={this.handleChangePositionInput}
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
