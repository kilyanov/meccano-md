import React, { Component } from 'react';
import { connect } from "react-redux";
import './archive-page.scss';
import Button from '../../Shared/Button/Button';
import IconButton from '../../Shared/IconButton/IconButton';
import TrashIcon from '../../Shared/SvgIcons/TrashIcon';
import SearchFilter from '../../Shared/SearchFilter/SearchFilter';
import ProjectTable from '../../Project/ProjectPage/ProjectTable/ProjectTable';
import PromiseDialogModal from '../../Shared/PromiseDialogModal/PromiseDialogModal';
import ArticleCreateModal from '../../Article/ArticleCreateModal/ArticleCreateModal';
import ArticlesExportModal from '../../Article/ArticlesExportModal/ArticlesExportModal';
import { ArchiveService, ArticleService, ProjectService, StorageService } from '../../../services';
import { NotificationManager } from 'react-notifications';
import ArticlesImportModal from '../../Article/ArticlesImportModal/ArticlesImportModal';
import Page from '../../Shared/Page/Page';
import Loader from '../../Shared/Loader/Loader';
import { SORT_DIR, STORAGE_KEY, PROJECT_PERMISSION } from '../../../constants';
import RightLoader from '../../Shared/Loader/RightLoader/RightLoader';
import { Plural } from '../../../helpers/Tools';
import InlineButton from '../../Shared/InlineButton/InlineButton';
import store from "../../../redux/store";
import { clearArticleColors } from "../../../redux/actions";
import { getColumnsFromStorage } from "../../Project/ProjectPage/ProjectTable/Columns";
import ArticleTransferModal from "../../Article/ArticleTransferModal/ArticleTransferModal";
import Pagination from "../../Shared/Pagination";
import ReactSelect from "../../Form/Select/ReactSelect/ReactSelect";
import ArchiveCreateModal from "../ArchiveCreateModal";
import { setCurrentProject } from "../../../redux/actions";
import StorageIcon from "../../Shared/SvgIcons/StorageIcon";
import { setCurrentArchive } from '../../../redux/actions';
import Breadcrumbs from '../../Shared/Breadcrumbs';
import AccessProject from '../../Shared/AccessProject';

const cls = new Bem('archive-page');
const defaultPagination = { page: 1, pageCount: 1, perPage: 50 };
const defaultSort = { type: null, dir: null };
const defaultFilters = { search: '', sort: defaultSort };

class ArchivePage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            archive: null,
            project: null,
            articles: [],
            activeArticle: null,
            selectedItemIds: [],
            selectedArticles: {},
            isAllArticlesSelected: false,
            pagination: { ...defaultPagination },
            filters: { ...defaultFilters },
            inProgress: true
        };
    }

    componentDidMount() {
        this.getArchive();
        this.getProject().then(this.getArticles);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.match.params.archiveId !== this.props.match.params.archiveId) {
            this.archiveId = this.props.match.params.archiveId;
            this.setState({
                articles: [],
                activeArticle: null,
                selectedItemIds: [],
                selectedStatus: [],
                isAllArticlesSelected: false,
                pagination: { ...defaultPagination },
                archive: null,
                filters: { ...defaultFilters },
                showArticleModal: false,
                showUploadArticlesModal: false,
                showImportArticlesModal: false,
                showTransferModal: false,
                inProgress: true
            }, () => this.getArchive(this.archiveId).then(this.getArticles));
        }
    }

    componentWillUnmount() {
        this.isMounted = false;
        this.props.clearArticleColors();
    }

    handleChangeFilter = (filter, value) => {
        this.setState(state => {
            state.filters[filter] = value;
            return state;
        });
    };

    handleChangeSelected = ({ articleIds }) => {
        if (!articleIds.length) {
            return this.handleClearSelected();
        }

        this.setState(state => {
            state.selectedArticles[state.pagination.page] = state.articles.filter(({ id }) => articleIds.includes(id));

            return state;
        });
    };

    handleSelectAll = ({ articleIds, checked }) => {
        if (!checked) {
            return this.handleClearSelected();
        }

        this.setState(state => {
            state.selectedArticles[state.pagination.page] = state.articles.filter(({ id }) => articleIds.includes(id));

            return state;
        });
    }

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
                title: '???????????????? ????????????',
                content: `???? ??????????????, ?????? ???????????? ?????????????? ???????????? "${article.title}"?`,
                submitText: '??????????????',
                danger: true
            }).then(() => {
                this.setState({ inProgress: true }, () => {
                    ArticleService
                        .delete({ articleIds: [ articleId ] }, project.id)
                        .then(() => {
                            NotificationManager.success('???????????? ???????? ?????????????? ??????????????', '???????????????? ????????????');
                            this.setState({
                                articles: this.state.articles.filter(({ id }) => id !== articleId),
                                selectedItemIds: [],
                                inProgress: false
                            }, this.getTotalCountArticles);
                        })
                        .catch(() => this.setState({ inProgress: false }));
                });
            });
        }
    };

    handleDeleteArticles = () => {
        const { articles, isAllArticlesSelected, pagination, project } = this.state;
        const countSelected = isAllArticlesSelected ? pagination.totalCount : this.getCountSelectedArticles();
        const selectedArticles = this.getAllSelectedArticles();
        const selectedArticlesIds = selectedArticles.map(({ id }) => id);

        if (countSelected) {
            this.promiseDialogModal.open({
                title: '???????????????? ????????????',
                content: `???? ??????????????, ?????? ???????????? ??????????????  ${Plural(
                    countSelected,
                    `${countSelected} `,
                    [ '????????????', '????????????', '????????????' ])}?`,
                submitText: '??????????????',
                danger: true
            }).then(() => {
                this.setState({ inProgress: true }, () => {
                    ArticleService
                        .delete(isAllArticlesSelected
                            ? { all: true, archiveId: this.archiveId }
                            : { articleIds: selectedArticlesIds }, project.id
                        )
                        .then(() => {
                            pagination.page = 1;
                            NotificationManager.success('?????????????????? ???????????? ?????????????? ??????????????', '????????????????');

                            this.setState({
                                pagination,
                                articles: isAllArticlesSelected
                                    ? []
                                    : articles.filter(({ id }) => !selectedArticlesIds.includes(id)),
                                selectedArticles: {},
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

    handleClearSelected = (isFull = false) => {
        this.setState(state => {
            if (isFull) {
                state.selectedArticles = {};
            } else {
                state.selectedArticles[state.pagination.page] = [];
            }
            state.isAllArticlesSelected = false;

            return state;
        });
    };

    handleChangeUserType = (userType) => {
        this.setState({ userType }, () => {
            if (!this.state.articles || !this.state.articles.length && !this.state.inProgress) {
                this.getArticles();
            }
        });
    };

    handleChangePage = (currentPage) => {
        this.searchParams.set('page', currentPage.toString());
        this.setState(state => {
            state.pagination.page = currentPage;
            state.inProgress = true;
            return state;
        }, this.getArticles);
    };

    handleChangeStatus = (selectedStatus) => {
        this.setState({ selectedStatus }, this.getArticles);
    };

    handleRestoreArticles = (articleIds = []) => {
        if (!articleIds.length) return;

        const { isAllArticlesSelected } = this.state;

        this.setState({ inProgress: true }, () => {
            ArchiveService
                .restoreArticles(this.archiveId, isAllArticlesSelected ? { all: true } : { articleIds })
                .then(this.getArticles)
                .finally(() => this.setState({ inProgress: false }));
        });
    }

    getArticles = () => {
        const { userType } = this.props;
        const { pagination, filters, inProgress } = this.state;
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


        // // ?????????????????????? ???????? ?????? ???????????????????? ???????????? ????????????????????????????
        // form.expand = [ ...form.expand, 'complete_monitor', 'complete_analytic', 'complete_client', 'user' ];

        // // ???????????????????? ???? ????????????????
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

        // // ???????????? ????????????????
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
        return ArchiveService
            .get(this.projectId, this.archiveId, { expand: 'user' })
            .then(response => {
                this.setState({ archive: response.data, inProgress: false });
                this.props.setCurrentArchive(response.data);
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
        const { userType } = this.props;
        const { project } = this.state;

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
        const { userType } = this.props;
        const { pagination } = this.state;
        const form = {
            // project: this.projectId,
            user_type: userType && userType.id || '',
            page: this.searchParams.get('page'),
            'per-page': pagination.perPage || 30
        };

        ArchiveService
            .articles
            .list(this.archiveId, form)
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
                label: '??????????????',
                value: 'open',
                isDisabled: values.includes('complete') || values.includes('user')
            },
            {
                label: '??????????????????',
                value: 'complete',
                isDisabled: values.includes('open')
            },
            {
                label: '????????????????',
                value: 'user',
                isDisabled: values.includes('open')
            }
        ];
    };

    getCountSelectedArticles = () => {
        const { selectedArticles } = this.state;

        return Object
            .keys(selectedArticles)
            .reduce((acc, page) => acc + selectedArticles[page].length, 0);
    };

    getAllSelectedArticles = () => {
        const { selectedArticles } = this.state;

        return Object
            .keys(selectedArticles)
            .reduce((acc, page) => [ ...acc, ...selectedArticles[page] ], []);
    };

    setSearchParams = () => {
        const { location, history } = this.props;

        location.search = this.searchParams.toString();
        history.replace(location);
    };

    onGetArticleMenu = (article) => {
        return [{
            title: '????????????????',
            link: `/project/${this.projectId}/article/${article.id}`
        }, {
            title: '????????????????????????',
            onClick: () => this.handleRestoreArticles([article.id])
        }, {
            danger: true,
            title: '??????????????',
            onClick: () => this.props.onDeleteArticle(article.id)
        }];
    };

    projectId = this.props.match.params.projectId;

    archiveId = this.props.match.params.archiveId;

    isMounted = true;

    searchParams = new URLSearchParams(this.props.location.search);

    render() {
        const { profile } = this.props;
        const {
            archive,
            project,
            activeArticle,
            isAllArticlesSelected,
            filters,
            showArticleModal,
            pagination,
            showUploadArticlesModal,
            showImportArticlesModal,
            showTransferModal,
            showCreateArchiveModal,
            selectedStatus,
            inProgress
        } = this.state;
        const countSelected = isAllArticlesSelected
            ? pagination.totalCount
            : this.getCountSelectedArticles();
        const hasSelectedItems = countSelected > 0;
        const selectedArticles = this.getAllSelectedArticles();
        const selectedArticleIds = selectedArticles.map(({ id }) => id);
        const articles = _.cloneDeep(this.state.articles)
            .map(article => {
                article.date = new Date(article.date);

                return article;
            });
        const fields = this.getFields();
        const currentPage = this.searchParams.get('page') || pagination.page;
        const userName = this.getUserName();

        if (_.isEmpty(profile)) return <Loader />;

        return (
            <AccessProject
                permissions={[ PROJECT_PERMISSION.ACCESS_ARCHIVE ]}
                redirect='/'
                replaceComponent={<Loader/>}
            >
                <Page {...cls()} withBar>
                    <Breadcrumbs location={this.props.location} />
                    <section {...cls('title-wrapper')} title={_.get(archive, 'description')}>
                        <StorageIcon {...cls('title-icon')} />
                        {archive && <h2 {...cls('title')}>??????????</h2>}
                        {archive && project && (
                            <div {...cls('additional-data')}>
                                <span {...cls('additional-data-project')}>{project.name}</span>
                                <div>
                                    <span {...cls('additional-data-user')}>{userName ? `${userName}, ` : ''}</span>
                                    <span>{moment(archive.date).format('D MMM YYYY[??. ??] HH:mm')}</span>
                                </div>
                            </div>
                        )}

                        {!!articles.length && (
                            <Button
                                {...cls('upload-btn')}
                                text={!countSelected || isAllArticlesSelected ? '?????????????????? ??????' :
                                    `?????????????????? ${Plural(
                                        countSelected,
                                        `${countSelected} `,
                                        [ '????????????', '????????????', '????????????' ]
                                    )}`}
                                style='success'
                                onClick={() => this.setState({ showUploadArticlesModal: true })}
                            />
                        )}

                        {!!selectedArticles.length && (
                            <Button
                                {...cls('upload-btn')}
                                text={`???????????????????????? ${isAllArticlesSelected 
                                    ? '??????' 
                                    : Plural(
                                        selectedArticles.length,
                                        `${selectedArticles.length} `,
                                        ['????????????', '????????????', '????????????']
                                    )}`
                                }
                                style='info'
                                onClick={() => this.handleRestoreArticles(selectedArticleIds)}
                            />
                        )}
                    </section>

                    <section {...cls('filters')}>
                        <IconButton
                            {...cls('filter-item')}
                            iconComponent={<TrashIcon/>}
                            text='??????????????'
                            danger
                            disabled={!hasSelectedItems}
                            onClick={this.handleDeleteArticles}
                        />

                        {hasSelectedItems && (
                            <>
                                <span>
                                    {Plural(countSelected, '', [ '??????????????', '??????????????', '??????????????' ])}
                                    {Plural(
                                        countSelected,
                                        ` ${countSelected} `,
                                        [ '????????????', '????????????', '????????????' ]
                                    )}
                                </span>

                                {(countSelected < pagination.totalCount && !isAllArticlesSelected) && (
                                    <InlineButton
                                        {...cls('filter-item')}
                                        small
                                        onClick={() => this.setState({ isAllArticlesSelected: true })}
                                    >
                                        ?????????????? ?????? ???????????? ?? ????????????
                                    </InlineButton>
                                )}

                                <InlineButton
                                    {...cls('filter-item')}
                                    small
                                    onClick={this.handleClearSelected}
                                >?????????? ??????????????????</InlineButton>
                            </>
                        )}

                        <SearchFilter
                            {...cls('filter-item')}
                            placeholder='??????????'
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
                            placeholder='????????????'
                        />
                    </section>

                    <div {...cls('project-table-wrapper')}>
                        <ProjectTable
                            onChangeSelected={this.handleChangeSelected}
                            onSelectedAll={this.handleSelectAll}
                            onChangeColumns={this.handleChangeColumns}
                            onChangeSort={this.handleChangeSort}
                            onDeleteArticle={this.handleDeleteArticle}
                            onChangeFilter={this.handleChangeFilter}
                            onUpdateParent={() => this.getArticles()}
                            getArticleMenu={this.onGetArticleMenu}
                            filters={filters}
                            sort={filters.sort}
                            search={filters.search}
                            page={currentPage}
                            selectedIds={(this.state.selectedArticles[pagination.page] || []).map(({ id }) => id)}
                            isAllSelected={isAllArticlesSelected}
                            projectId={this.projectId}
                            archiveId={this.archiveId}
                            articles={articles}
                            pagination={pagination}
                            fields={fields}
                        />

                        <div {...cls('footer')}>
                            <Pagination
                                page={currentPage}
                                pageCount={pagination.pageCount}
                                onPageChange={this.handleChangePage}
                            />

                            <span {...cls('articles-count')}>
                                ?????????? {Plural(pagination.totalCount || 0, `${pagination.totalCount || 0} `,
                                    [ '????????????', '????????????', '????????????' ])}
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
                            archiveId={this.archiveId}
                            projectId={this.projectId}
                            selectedArticleIds={isAllArticlesSelected || selectedArticleIds}
                            onUpdateParent={() => this.handleClearSelected(true)}
                            onClose={() => this.setState({ showUploadArticlesModal: false })}
                        />
                    )}

                    {showImportArticlesModal && (
                        <ArticlesImportModal
                            onClose={() => {
                                if (this.isMounted) {
                                    this.setState({ showImportArticlesModal: false });
                                }
                            }}
                            onSubmit={this.handleImportArticlesSubmit}
                            projectId={this.projectId}
                        />
                    )}

                    {showTransferModal && (
                        <ArticleTransferModal
                            onClose={() => this.setState({ showTransferModal: false })}
                            onUpdateParent={() => {
                                this.handleClearSelected(true);
                                this.getArticles();
                            }}
                            projectId={this.projectId}
                            articleIds={selectedArticleIds}
                        />
                    )}

                    {showCreateArchiveModal && (
                        <ArchiveCreateModal
                            onClose={() => this.setState({ showCreateArchiveModal: false })}
                            projectId={this.projectId}
                            articleIds={selectedArticleIds}
                            onSuccessCreate={() => {
                                this.handleClearSelected(true);
                                this.getArticles();
                            }}
                        />
                    )}

                    <PromiseDialogModal ref={node => this.promiseDialogModal = node}/>

                    {inProgress && <Loader fixed/>}

                    {pagination.inProgress && <RightLoader/>}
                </Page>
            </AccessProject>
        );
    }
}

function mapStateToProps(state) {
    return {
        profile: state.profile,
        userType: state.userType
    };
}

function mapDispatchToProps(dispatch) {
    return {
        setCurrentArchive: (value) => dispatch(setCurrentArchive(value)),
        clearArticleColors: () => dispatch(clearArticleColors())
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ArchivePage);
