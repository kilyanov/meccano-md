import React, {Component} from 'react';
import PropTypes from 'prop-types';
import InlineButton from '@components/Shared/InlineButton/InlineButton';
import InputText from '@components/Form/InputText/InputText';
import ConfirmModal from '@components//Shared/ConfirmModal/ConfirmModal';
import PencilIcon from '@components/Shared/SvgIcons/PencilIcon';
import TrashIcon from '@components/Shared/SvgIcons/TrashIcon';
import ArrowIcon from '@components/Shared/SvgIcons/ArrowIcon';
import {ProjectService} from '@services';
import PromiseDialogModal from '@components/Shared/PromiseDialogModal/PromiseDialogModal';
import Loader from '@components/Shared/Loader/Loader';
import ProjectKeyWordsImport from './ProjectKeyWordsImport/ProjectKeyWordsImport';
import CheckBox from '@components//Form/CheckBox/CheckBox';
import {Plural} from '@helpers/Tools';
import Sortable from 'react-sortablejs';
import SearchFilter from '@components/Shared/SearchFilter/SearchFilter';
import './project-key-words.scss';
import ProjectKeyWordColors
    from "@components/Project/ProjectCreatePage/ProjectKeyWords/ProjectKeyWordColors/ProjectKeyWordColors";

const cls = new Bem('project-key-words');

export default class ProjectKeyWords extends Component {
    static propTypes = {
        projectId: PropTypes.string.isRequired
    };

    state = {
        showCreateModal: false,
        showColorsModal: false,
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
            title: '???????????????? ????????',
            content: `???? ??????????????, ?????? ???????????? ?????????????? ${Plural(
                selectedWords.length, 
                `${selectedWords.length} `, 
                ['??????????', '??????????', '????????'])}?`,
            submitText: '??????????????',
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
            title: '???????????????? ?????????????????? ??????????',
            content: `???? ??????????????, ?????? ???????????? ?????????????? ???????????????? ?????????? "${keyWord.name}"?`,
            submitText: '??????????????',
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
        this.setState({ inProgress: true }, this.getItems);
    }

    getItems = (isPagination) => {
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
                    keyWords: isPagination ? keyWords.concat(response.data) : response.data,
                    pagination: responsePagination,
                    inProgress: false
                });
            }).catch(() => this.setState({inProgress: false}));
    };

    updateWordPosition = (wordId, position, isGetItems) => {
        ProjectService.wordSearch
            .update({ position }, this.props.projectId, wordId)
            .then(() => {
                if (isGetItems) {
                    this.getItems();
                }
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
        const { page, pageCount } = this.state.pagination;

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
                        title='?? ???????????? ????????????'
                    >
                        <ArrowIcon {...cls('list-item-icon', 'arrow-to-start')}/>
                    </button>
                    <button
                        {...cls('list-item-button', 'move-end')}
                        onClick={() => this.updateWordPositionToEnd(keyWord, index)}
                        title='?? ?????????? ????????????'
                    >
                        <ArrowIcon {...cls('list-item-icon', 'arrow-to-end')}/>
                    </button>
                    <button
                        {...cls('list-item-button', 'edit')}
                        onClick={() => this.handleSelectWord(keyWord)}
                        title='??????????????????????????'
                    >
                        <PencilIcon {...cls('list-item-icon', 'pencil')}/>
                    </button>
                    <button
                        {...cls('list-item-button', 'remove')}
                        onClick={() => this.handleDeleteWord(keyWord)}
                        title='??????????????'
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
            showColorsModal,
            selectedWord,
            selectedWords,
            wordValue,
            wordPosition,
            inProgress,
            modalInProgress
        } = this.state;

        return (
            <div {...cls('', '', 'container')}>
                <h3>???????????????? ??????????</h3>

                <section {...cls('buttons-panel')}>
                    <div>
                        <InlineButton
                            {...cls('buttons-panel-item')}
                            ref={ref => this.addButtonRef = ref}
                            onClick={() => this.setState({showCreateModal: true})}
                        >+ ????????????????</InlineButton>

                        <InlineButton
                            {...cls('buttons-panel-item')}
                            onClick={() => this.setState({showImportModal: true})}
                        >???????????? ????????</InlineButton>

                        {!!keyWords.length && (
                            <InlineButton
                                {...cls('buttons-panel-item')}
                                onClick={() => this.setState({ showColorsModal: true })}
                            >?????????????????? ??????????????????</InlineButton>
                        )}
                    </div>

                    {!!selectedWords.length && (
                        <div {...cls('buttons-panel-item')}>
                            <span {...cls('buttons-panel-item')}>
                                {Plural(
                                    selectedWords.length,
                                    '',
                                    ['??????????????', '??????????????', '??????????????']
                                )}
                                {Plural(
                                    selectedWords.length,
                                    ` ${selectedWords.length} `,
                                    ['??????????', '??????????', '????????']
                                )}
                            </span>

                            {selectedWords.length < keyWords.length && (
                                <InlineButton
                                    {...cls('buttons-panel-item')}
                                    onClick={this.handleSelectAllWords}
                                >?????????????? ?????? ??????????</InlineButton>
                            )}

                            <InlineButton
                                {...cls('buttons-panel-item')}
                                onClick={() => this.setState({selectedWords: []})}
                            >?????????? ??????????????????</InlineButton>

                            <InlineButton
                                {...cls('buttons-panel-item')}
                                onClick={this.handleDeleteSelected}
                                danger
                            >??????????????</InlineButton>
                        </div>
                    )}

                    <SearchFilter
                        {...cls('filter-item')}
                        placeholder='??????????'
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
                    {keyWords.map((keyWord, index) => (
                        <div
                            data-id={keyWord.id}
                            key={keyWord.id}
                        >
                            {this.renderItem(index)}
                        </div>
                    ))}
                </Sortable>

                {!keyWords.length && <p { ...cls('empty-message') }>???????????????? ???????? ???????? ??????</p>}

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
                                    title='??????????????????????????'
                                >
                                    <PencilIcon {...cls('list-item-icon', 'pencil')}/>
                                </button>
                                <button
                                    {...cls('list-item-button', 'remove')}
                                    onClick={() => this.handleDeleteWord(keyWord)}
                                    title='??????????????'
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
                        title={selectedWord ? '???????????????????? ??????????' : '???????????????????? ??????????'}
                        onClose={this.handleCloseCreateModal}
                        submitText={selectedWord ? '????????????????' : '????????????????'}
                        onSubmit={this.handleSubmit}
                        width='small'
                    >
                        <InputText
                            autoFocus
                            {...cls('field')}
                            label='????????????????'
                            value={wordValue}
                            onChange={this.handleChangeInput}
                            onEnter={this.handleSubmit}
                        />

                        <InputText
                            {...cls('field')}
                            label='??????????????'
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

                {(!!keyWords.length && showColorsModal) && (
                    <ProjectKeyWordColors
                        projectId={projectId}
                        onClose={() => this.setState({ showColorsModal: false })}
                    />
                )}

                <PromiseDialogModal ref={ref => this.dialogModal = ref} />

                {inProgress && <Loader fixed/>}
            </div>
        );
    }
}
