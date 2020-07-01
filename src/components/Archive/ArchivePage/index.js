import React, { Fragment, Component } from 'react';
import './archive-page.scss';
import Button from '../../Shared/Button/Button';
import IconButton from '../../Shared/IconButton/IconButton';
import TrashIcon from '../../Shared/SvgIcons/TrashIcon';
import ServicesIcon from '../../Shared/SvgIcons/ServicesIcon';
import StarIcon from '../../Shared/SvgIcons/StarIcon';
import SearchFilter from '../../Shared/SearchFilter/SearchFilter';
import ProjectTable from '../../Project/ProjectPage/ProjectTable/ProjectTable';
import PromiseDialogModal from '../../Shared/PromiseDialogModal/PromiseDialogModal';
import ArticleCreateModal from '../../Article/ArticleCreateModal/ArticleCreateModal';
import ArticlesExportModal from '../../Article/ArticlesExportModal/ArticlesExportModal';
import { ArchiveService, ArticleService, ProjectService, StorageService } from '../../../services';
import { NotificationManager } from 'react-notifications';
import DropDownButton from '../../Shared/DropDownButton/DropDownButton';
import ArticlesImportModal from '../../Article/ArticlesImportModal/ArticlesImportModal';
import Page from '../../Shared/Page/Page';
import Loader from '../../Shared/Loader/Loader';
import { EVENTS, SORT_DIR, STORAGE_KEY } from '../../../constants';
import RightLoader from '../../Shared/Loader/RightLoader/RightLoader';
import { Plural } from '../../../helpers/Tools';
import InlineButton from '../../Shared/InlineButton/InlineButton';
import { EventEmitter } from "../../../helpers";
import store from "../../../redux/store";
import { clearArticleColors, setArticleColors } from "../../../redux/actions/articleColors";
import { getColumnsFromStorage } from "../../Project/ProjectPage/ProjectTable/Columns";
import ArticleTransferModal from "../../Article/ArticleTransferModal/ArticleTransferModal";
import ProjectPagination from "../../Project/ProjectPage/ProjectTable/ProjectPagination/ProjectPagintaion";
import ReactSelect from "../../Form/Select/ReactSelect/ReactSelect";
import ArchiveCreateModal from "../ArchiveCreateModal";
import { setCurrentProject } from "../../../redux/actions/currentProject";
import StorageIcon from "../../Shared/SvgIcons/StorageIcon";

const cls = new Bem('archive-page');
const defaultPagination = { page: 1, pageCount: 1, perPage: 50 };
const defaultSort = { type: null, dir: null };
const defaultFilters = { search: '', sort: defaultSort };

export default class ArchivePage extends Component {
    constructor(props) {
        super(props);

        const pagination = { ...defaultPagination };
        const storageUserType = StorageService.get(STORAGE_KEY.USER_TYPE);
        let userType = null;

        pagination.perPage = StorageService.get(STORAGE_KEY.TABLE_PER_PAGE) || 50;

        if (storageUserType) {
            userType = JSON.parse(storageUserType);
        }

        this.state = {
            archive: null,
            project: null,
            articles: [],
            activeArticle: null,
            selectedItemIds: [],
            selectedArticles: [],
            isAllArticlesSelected: false,
            pagination,
            userType,
            filters: defaultFilters,
            inProgress: true
        };
    }

    componentDidMount() {
        this.getArchive();
        this.getProject().then(this.getArticles);
    }

    componentDidUpdate(prevProps) {
        // if (prevProps.match.params.id !== this.props.match.params.id) {
        //     this.projectId = this.props.match.params.id;
        //     this.setState({
        //         articles: [],
        //         activeArticle: null,
        //         selectedItemIds: [],
        //         selectedStatus: [],
        //         isAllArticlesSelected: false,
        //         pagination: defaultPagination,
        //         project: null,
        //         filters: defaultFilters,
        //         showArticleModal: false,
        //         showUploadArticlesModal: false,
        //         showImportArticlesModal: false,
        //         showTransferModal: false,
        //         inProgress: true
        //     }, () => {
        //         this.getProject(this.projectId).then(this.getArticles);
        //         this.getArticleColors();
        //     });
        // }
    }

    componentWillUnmount() {
        this.isMounted = false;
        EventEmitter.off(EVENTS.USER.CHANGE_TYPE, this.handleChangeUserType);
        store.dispatch(clearArticleColors());
    }

    handleChangeFilter = (filter, value) => {
        this.setState(state => {
            state.filters[filter] = value;
            return state;
        });
    };

    handleChangeSelected = (selectedItemIds) => {
        if (!selectedItemIds.length) {
            return this.handleClearSelected();
        }

        this.setState(state => {
            state.selectedItemIds = selectedItemIds;
            state.selectedArticles = [];

            selectedItemIds.forEach(selectedId => {
                const found = state.articles.find(({ id }) => id === selectedId);

                if (found && !state.selectedArticles.find(({ id }) => id === selectedId)) {
                    state.selectedArticles.push(found);
                }
            });
            return state;
        });
    };

    handleChangeColumns = () => {
        this.setState(state => {
            state.inProgress = true;
            state.pagination.perPage = StorageService.get(STORAGE_KEY.TABLE_PER_PAGE) || 50;
            return state;
        }, this.getArticles);
    };

    handleDeleteArticle = (articleId) => {
        const { articles, project } = this.state;
        const article = articles.find(({ id }) => id === articleId);

        if (articleId && article) {
            this.promiseDialogModal.open({
                title: 'Удаление статьи',
                content: `Вы уверены, что хотите удалить статью "${article.title}"?`,
                submitText: 'Удалить',
                danger: true
            }).then(() => {
                this.setState({ inProgress: true }, () => {
                    ArticleService.delete({ articleIds: [ articleId ] }, project.id)
                        .then(() => {
                            NotificationManager.success('Статья была успешно удалена', 'Удаление статьи');
                            this.setState({
                                articles: this.state.articles.filter(({ id }) => id !== articleId),
                                inProgress: false
                            }, this.getTotalCountArticles);
                        })
                        .catch(() => this.setState({ inProgress: false }));
                });
            });
        }
    };

    handleDeleteArticles = () => {
        const { articles, selectedItemIds, isAllArticlesSelected, pagination, project } = this.state;
        const countSelected = isAllArticlesSelected ? pagination.totalCount : selectedItemIds.length;

        if (countSelected) {
            this.promiseDialogModal.open({
                title: 'Удаление статей',
                content: `Вы уверены, что хотите удалить  ${Plural(
                    countSelected,
                    `${countSelected} `,
                    [ 'статью', 'статьи', 'статей' ])}?`,
                submitText: 'Удалить',
                style: 'danger'
            }).then(() => {
                this.setState({ inProgress: true }, () => {
                    ArticleService.delete(isAllArticlesSelected ? { all: true } : { articleIds: selectedItemIds }, project.id)
                        .then(() => {
                            pagination.page = 1;
                            NotificationManager.success('Выбранные статьи успешно удалены', 'Удаление');

                            this.setState({
                                pagination,
                                articles: isAllArticlesSelected
                                    ? []
                                    : articles.filter(({ id }) => !selectedItemIds.includes(id)),
                                selectedItemIds: [],
                                isAllArticlesSelected: false
                            }, this.getArticles);
                        })
                        .catch(() => this.setState({ inProgress: false }));
                });
            });
        }
    };

    handleCreateArticle = (article) => {
        const { articles } = this.state;

        articles.unshift(article);

        this.setState({ articles });
    };

    handleUpdateArticle = (newArticle) => {
        this.setState({
            articles: this.state.articles.map(article =>
                (article.id === newArticle.id) ? newArticle : article
            )
        });
    };

    handleChangeSort = (sort) => {
        const newState = this.state;

        newState.filters.sort = sort;
        newState.pagination = defaultPagination;
        newState.articles = [];
        newState.inProgress = true;

        this.setState(newState, this.getArticles);
    };

    handleImportArticlesSubmit = () => {
        if (!this.isMounted) return;

        this.setState({
            pagination: defaultPagination,
            filters: defaultFilters,
            articles: [],
            inProgress: true
        }, this.getArticles);
    };

    handleClearSelected = () => {
        this.setState({
            selectedItemIds: [],
            isAllArticlesSelected: false
        });
    };

    handleChangeUserType = (userType) => {
        this.setState({ userType }, () => {
            if (!this.state.articles || !this.state.articles.length && !this.state.inProgress) {
                this.getArticles();
            }
        });
    };

    handleCompleteArticles = (isComplete = true) => {
        const { selectedItemIds, userType } = this.state;

        if (userType && userType.slug) {
            const form = {
                articleIds: selectedItemIds,
                properties: {
                    [`complete_${userType.slug}`]: isComplete
                }
            };

            this.setState({ inProgress: true }, () => {
                ProjectService
                    .updateMany(form, this.projectId)
                    .then(() => {
                        this.setState({ selectedItemIds: [] });
                        this.getArticles();
                    })
                    .catch(() => this.setState({ inProgress: false }));
            });
        }
    };

    handleChangePage = ({ selected }) => {
        this.searchParams.set('page', (selected + 1).toString());
        this.setState(state => {
            state.pagination.page = selected + 1;
            state.inProgress = true;
            return state;
        }, this.getArticles);
    };

    handleChangeStatus = (selectedStatus) => {
        this.setState({ selectedStatus }, this.getArticles);
    };

    handleReplaceToArchive = () => {
        this.setState({ showCreateArchiveModal: true });
    };

    getArticleColors = () => {
        ArticleService.color.get(this.projectId).then(response => {
            if (response.data) {
                store.dispatch(setArticleColors(response.data));
            }
        });
    };

    getArticles = () => {
        const { pagination, filters, userType, inProgress } = this.state;
        const selectedColumns = getColumnsFromStorage(this.projectId);
        const fields = this.getFields();
        
        if (!inProgress) {
            this.setState({ inProgress: true });
        }

        const form = {
            // project: this.projectId,
            user_type: userType && userType.id || '',
            page: this.searchParams.get('page'),
            'per-page': pagination.perPage || 30,
            expand: fields
                .filter(({ code, slug }) => selectedColumns.find(({ key }) => key === code || key === slug))
                .map(field => field.relation || field.slug)
                .join(',')
        };


        // // Необходимые поля для корректной работы цветовыделения
        // form.expand = [ ...form.expand, 'complete_monitor', 'complete_analytic', 'complete_client', 'user' ];

        // // Фильтрация по столбцам
        Object.keys(filters).forEach(filterKey => {
            const filter = filters[filterKey];
            const currentField = fields.find(({ slug }) => filterKey === 'sort'
                ? filter.type === slug
                : filterKey === slug
            );

            switch (filterKey) {
                case 'sort':
                    if (!filter.type) break;

                    form.sort = filter.type &&
                        `${filter.dir === SORT_DIR.ASC ? '-' : ''}${currentField.relation || filter.type}`;
                    this.searchParams.set('sort', `${filter.dir === SORT_DIR.ASC ? '-' : ''}${filter.type}`);
                    break;
                case 'search':
                    fields
                        .filter(({ slug }) => selectedColumns.find(({ key }) => key === slug))
                        .forEach(field => {
                            if (filter && filter.length) {
                                form[`query[${field.relation || field.slug}]`] = filter;
                            } else {
                                delete form[`query[${field.relation || field.slug}]`];
                            }
                        });
                    this.searchParams.set(filterKey, filter);
                    break;
                default:
                    if (filter && filter.length) {
                        form[`filter[${currentField.relation || currentField.slug}]`] = filter;
                        this.searchParams.set(filterKey, filter);
                    } else {
                        delete [ `filter[${currentField.relation || currentField.slug}]` ];
                        this.searchParams.delete(filterKey);
                    }
            }
        });

        // // Фильтр Статусов
        // if (statusValues.includes('open') && userType) {
        //     form[`query[complete_${userType.slug}]`] = false;
        //     form['query[user_id]'] = 'null';
        // }
        //
        // if (statusValues.includes('complete') && userType) {
        //     form[`query[complete_${userType.slug}]`] = true;
        // }
        //
        // if (statusValues.includes('user')) {
        //     form['query[user_id]'] = 'not null';
        // }

        ArchiveService
            .articles
            .list(this.archiveId, form)
            .then(response => {
                console.log(response)
                const responsePagination = {
                    pageCount: +_.get(response.headers, 'x-pagination-page-count'),
                    page: +_.get(response.headers, 'x-pagination-current-page'),
                    perPage: +_.get(response.headers, 'x-pagination-per-page'),
                    totalCount: +_.get(response.headers, 'x-pagination-total-count')
                };

                if (responsePagination.page) {
                    this.searchParams.set('page', responsePagination.page.toString());
                }

                this.setSearchParams();

                this.setState({
                    articles: response.data,
                    pagination: responsePagination,
                    inProgress: false
                });
            })
            .catch(() => this.setState({ inProgress: false }));
    };

    getArchive = () => {
        ArchiveService
            .get(this.projectId, this.archiveId, { expand: 'user' })
            .then(response => {
                this.setState({ archive: response.data, inProgress: false });
            });
    };

    getProject = () => {
        return ProjectService
            .get({ expand: 'projectFields,users', pageSize: 50 }, this.projectId)
            .then(response => {
                store.dispatch(setCurrentProject(response.data));
                return this.setState({ project: response.data });
            });
    };

    getFields = () => {
        const { project, userType } = this.state;

        if (!project || !project.projectFields || !project.projectFields.length || !userType) {
            return [];
        }

        const fields = project.projectFields.find(field => field.user_type_id === userType.id);

        if (fields && fields.data) {
            return fields.data;
        }
    };

    getUserName = () => {
        if (!this.state.archive || !this.state.archive.user) {
            return '';
        }

        const { user } = this.state.archive;

        if (!user.name && !user.surname) {
            return user.username || '';
        }

        return `${user.surname ? `${user.surname} ` : ''}${user.name ? `${user.name} ` : ''}`;
    };

    getTotalCountArticles = () => {
        ArticleService
            .getList({ project: this.projectId })
            .then(response => {
                const newState = this.state;

                newState.pagination.totalCount = +_.get(response.headers, 'x-pagination-total-count');
                this.setState(newState);
            });
    };

    getStatusOptions = () => {
        const { selectedStatus } = this.state;
        const values = (selectedStatus || []).map(({ value }) => value);

        return [
            {
                label: 'Открыта',
                value: 'open',
                isDisabled: values.includes('complete') || values.includes('user')
            },
            {
                label: 'Завершена',
                value: 'complete',
                isDisabled: values.includes('open')
            },
            {
                label: 'Передана',
                value: 'user',
                isDisabled: values.includes('open')
            }
        ];
    };

    setSearchParams = () => {
        const { location, history } = this.props;

        location.search = this.searchParams.toString();
        history.replace(location);
    };

    projectId = this.props.match.params.projectId;

    archiveId = this.props.match.params.id;

    isMounted = true;

    searchParams = new URLSearchParams(this.props.location.search);

    render() {
        const {
            archive,
            project,
            activeArticle,
            selectedItemIds,
            isAllArticlesSelected,
            filters,
            showArticleModal,
            pagination,
            showUploadArticlesModal,
            showImportArticlesModal,
            showTransferModal,
            showCreateArchiveModal,
            selectedArticles,
            selectedStatus,
            inProgress
        } = this.state;
        const countSelected = isAllArticlesSelected ? pagination.totalCount : selectedItemIds.length;
        const articles = _.cloneDeep(this.state.articles)
            .map(article => {
                article.date = new Date(article.date);

                return article;
            });
        const fields = this.getFields();
        const currentPage = this.searchParams.get('page') || pagination.page;
        const userName = this.getUserName();

        return (
            <Page {...cls()} withBar>
                <section {...cls('title-wrapper')} title={_.get(archive, 'description')}>
                    <StorageIcon { ...cls('title-icon') } />
                    {archive && <h2 {...cls('title')}>Архив</h2>}
                    {archive && project && (
                        <div {...cls('additional-data')}>
                            <span { ...cls('additional-data-project') }>{project.name}</span>
                            <div>
                                <span { ...cls('additional-data-user') }>{userName ? `${userName}, ` : ''}</span>
                                <span>{moment(archive.date).format('D MMM YYYY[г. в] HH:mm')}</span>
                            </div>
                        </div>
                    )}

                    {!!articles.length && (
                        <Button
                            {...cls('upload-btn')}
                            text={!countSelected || isAllArticlesSelected ? 'Выгрузить все' :
                                `Выгрузить ${Plural(
                                    countSelected,
                                    `${countSelected} `,
                                    [ 'статью', 'статьи', 'статей' ]
                                )}`}
                            style='success'
                            onClick={() => this.setState({ showUploadArticlesModal: true })}
                        />
                    )}
                </section>

                <section {...cls('filters')}>
                    {!!selectedItemIds.length && (
                        <Fragment>
                            <span>
                                {Plural(countSelected, '', [ 'Выбрана', 'Выбраны', 'Выбраны' ])}
                                {Plural(
                                    countSelected,
                                    ` ${countSelected} `,
                                    [ 'статья', 'статьи', 'статей' ]
                                )}
                            </span>

                            {(countSelected < pagination.totalCount && !isAllArticlesSelected) && (
                                <InlineButton
                                    {...cls('filter-item')}
                                    small
                                    onClick={() => this.setState({ isAllArticlesSelected: true })}
                                >
                                    Выбрать все статьи в архиве
                                </InlineButton>
                            )}

                            <InlineButton
                                {...cls('filter-item')}
                                small
                                onClick={this.handleClearSelected}
                            >Снять выделение</InlineButton>
                        </Fragment>
                    )}

                    <SearchFilter
                        {...cls('filter-item')}
                        placeholder='Найти'
                        value={filters.search}
                        onChange={value => this.handleChangeFilter('search', value)}
                        onSearch={() => this.getArticles()}
                    />

                    <ReactSelect
                        {...cls('filter-item', 'select')}
                        isMulti
                        options={this.getStatusOptions()}
                        onChange={this.handleChangeStatus}
                        selected={selectedStatus}
                        placeholder='Статус'
                    />
                </section>

                <div {...cls('project-table-wrapper')}>
                    <ProjectTable
                        onChangeSelected={this.handleChangeSelected}
                        onChangeColumns={this.handleChangeColumns}
                        onChangeSort={this.handleChangeSort}
                        onDeleteArticle={this.handleDeleteArticle}
                        onChangeFilter={this.handleChangeFilter}
                        onUpdateParent={() => this.getArticles()}
                        sort={filters.sort}
                        search={filters.search}
                        page={currentPage}
                        selectedIds={selectedItemIds}
                        isAllSelected={isAllArticlesSelected}
                        projectId={this.projectId}
                        archiveId={this.archiveId}
                        articles={articles}
                        pagination={pagination}
                        fields={fields}
                    />

                    <div {...cls('footer')}>
                        <ProjectPagination
                            page={currentPage}
                            pageCount={pagination.pageCount}
                            onPageChange={this.handleChangePage}
                        />

                        <span {...cls('articles-count')}>
                            Всего {Plural(
                            pagination.totalCount || 0,
                            `${pagination.totalCount || 0} `,
                            [ 'статья', 'статьи', 'статей' ])}
                        </span>
                    </div>
                </div>

                {showArticleModal && (
                    <ArticleCreateModal
                        article={activeArticle || {}}
                        projectId={this.projectId}
                        onClose={() => this.setState({ activeArticle: null, showArticleModal: false })}
                        onAddArticle={this.handleCreateArticle}
                        onUpdateArticle={this.handleUpdateArticle}
                    />
                )}

                {showUploadArticlesModal && (
                    <ArticlesExportModal
                        projectId={this.projectId}
                        selectedArticleIds={isAllArticlesSelected || selectedItemIds}
                        onUpdateParent={this.handleClearSelected}
                        onClose={() => this.setState({ showUploadArticlesModal: false })}
                    />
                )}

                {showImportArticlesModal && (
                    <ArticlesImportModal
                        onClose={() => {
                            if (this.isMounted) this.setState({ showImportArticlesModal: false });
                        }}
                        onSubmit={this.handleImportArticlesSubmit}
                        projectId={this.projectId}
                    />
                )}

                {showTransferModal && (
                    <ArticleTransferModal
                        onClose={() => this.setState({ showTransferModal: false })}
                        onUpdateParent={() => {
                            this.handleClearSelected();
                            this.getArticles();
                        }}
                        projectId={this.projectId}
                        articleIds={selectedItemIds}
                    />
                )}

                {showCreateArchiveModal && (
                    <ArchiveCreateModal
                        onClose={() => this.setState({ showCreateArchiveModal: false })}
                        projectId={this.projectId}
                        articleIds={selectedArticles.map(({ id }) => id)}
                        onSuccessCreate={() => {
                            this.setState({ selectedArticles: [] });
                            this.getArticles();
                        }}
                    />
                )}

                <PromiseDialogModal ref={node => this.promiseDialogModal = node}/>

                {inProgress && <Loader fixed/>}

                {pagination.inProgress && <RightLoader/>}
            </Page>
        );
    }
}
