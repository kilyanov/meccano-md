import React, { Fragment, Component } from 'react';
import './project-page.scss';
import Button from '../../Shared/Button/Button';
import IconButton from '../../Shared/IconButton/IconButton';
import TrashIcon from '../../Shared/SvgIcons/TrashIcon';
import ServicesIcon from '../../Shared/SvgIcons/ServicesIcon';
import StarIcon from '../../Shared/SvgIcons/StarIcon';
import SearchFilter from '../../Shared/SearchFilter/SearchFilter';
import ProjectTable from './ProjectTable/ProjectTable';
import PromiseDialogModal from '../../Shared/PromiseDialogModal/PromiseDialogModal';
import ArticleCreateModal from '../../Article/ArticleCreateModal/ArticleCreateModal';
import ArticlesExportModal from '../../Article/ArticlesExportModal/ArticlesExportModal';
import { ArticleService, ProjectService, StorageService } from '@services';
import { NotificationManager } from 'react-notifications';
import DropDownButton from '../../Shared/DropDownButton/DropDownButton';
import ArticlesImportModal from '../../Article/ArticlesImportModal/ArticlesImportModal';
import Page from '../../Shared/Page/Page';
import Loader from '../../Shared/Loader/Loader';
import { EVENTS, SORT_DIR, STORAGE_KEY } from '@const';
import RightLoader from '../../Shared/Loader/RightLoader/RightLoader';
import { isProjectAccess, Plural, QueueManager } from '@helpers/Tools';
import InlineButton from '../../Shared/InlineButton/InlineButton';
import { EventEmitter } from "../../../helpers";
import store from "../../../redux/store";
import { setCurrentProject } from "@redux/actions/currentProject";
import { clearArticleColors, setArticleColors } from "@redux/actions/articleColors";
import { getColumnsFromStorage } from "./ProjectTable/Columns";
import ArticleTransferModal from "../../Article/ArticleTransferModal/ArticleTransferModal";
import ProjectPagination from "./ProjectTable/ProjectPagination/ProjectPagintaion";
import ReactSelect from "../../Form/Select/ReactSelect/ReactSelect";
import { PROJECT_PERMISSION } from "@const";
import Breadcrumbs from '../../Shared/Breadcrumbs';
import ArchiveModal from '../../Archive/ArchiveModal';
import AccessProject from '../../Shared/AccessProject';
import { connect } from 'react-redux';
import { FaEye, FaEdit } from 'react-icons/fa';
import { setAppProgress } from '../../../redux/actions';

const cls = new Bem('project-page');
const defaultPagination = { page: 1, pageCount: 1, perPage: 50 };
const defaultSort = { type: null, dir: null };
const defaultFilters = { search: '', sort: defaultSort };
const statusOptions = [
    {
        label: 'Открыта',
        value: 'open'
    },
    {
        label: 'Завершена',
        value: 'complete'
    },
    {
        label: 'Передана',
        value: 'user'
    }
];

class ProjectPage extends Component {
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
            articles: [],
            activeArticle: null,
            selectedArticles: {},
            selectedStatus: [],
            isAllArticlesSelected: false,
            pagination,
            project: null,
            filters: defaultFilters,
            showArticleModal: false,
            showUploadArticlesModal: false,
            showImportArticlesModal: false,
            showTransferModal: false,
            showArchiveModal: false,
            userType,
            isEditMode: false
        };
    }

    componentDidMount() {
        this.searchParamsToFilters(() => {
            this.getProject(this.projectId).then(this.getArticles);
            this.getArticleColors();
            EventEmitter.on(EVENTS.USER.CHANGE_TYPE, this.handleChangeUserType);
            this.props.onSetAppProgress({ inProgress: true, withBlockedOverlay: true });
        });
    }

    componentDidUpdate(prevProps) {
        if (prevProps.match.params.id !== this.props.match.params.id) {
            this.projectId = this.props.match.params.id;
            this.props.onSetAppProgress({ inProgress: true, withBlockedOverlay: true });
            this.setState({
                articles: [],
                activeArticle: null,
                selectedArticles: {},
                selectedStatus: [],
                isAllArticlesSelected: false,
                pagination: defaultPagination,
                project: null,
                filters: defaultFilters,
                showArticleModal: false,
                showUploadArticlesModal: false,
                showImportArticlesModal: false,
                showTransferModal: false
            }, () => {
                this.getProject(this.projectId).then(this.getArticles);
                this.getArticleColors();
            });
        }
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
        this.props.onSetAppProgress({ inProgress: true, withBlockedOverlay: true });
        this.setState(state => {
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
                this.props.onSetAppProgress({ inProgress: true, withBlockedOverlay: true });
                ArticleService.delete({ articleIds: [ articleId ] }, project.id)
                    .then(() => {
                        NotificationManager.success('Статья была успешно удалена', 'Удаление статьи');
                        this.setState({
                            articles: this.state.articles.filter(({ id }) => id !== articleId)
                        }, this.getTotalCountArticles);
                    })
                    .finally(() => this.props.onSetAppProgress({ inProgress: false }));
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
                title: 'Удаление статей',
                content: `Вы уверены, что хотите удалить  ${Plural(
                    countSelected,
                    `${countSelected} `,
                    [ 'статью', 'статьи', 'статей' ])}?`,
                submitText: 'Удалить',
                style: 'danger'
            }).then(() => {
                this.props.onSetAppProgress({ inProgress: true, withBlockedOverlay: true });
                ArticleService
                    .delete(isAllArticlesSelected
                        ? { all: true }
                        : { articleIds: selectedArticlesIds }, project.id
                    )
                    .then(() => {
                        pagination.page = 1;
                        NotificationManager.success('Выбранные статьи успешно удалены', 'Удаление');

                        this.setState({
                            pagination,
                            articles: isAllArticlesSelected
                                ? []
                                : articles.filter(({ id }) => !selectedArticlesIds.includes(id)),
                            selectedArticles: {},
                            isAllArticlesSelected: false
                        }, this.getArticles);
                    })
                    .finally(() => this.props.onSetAppProgress({ inProgress: false }));
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

        this.props.onSetAppProgress({
            inProgress: true,
            withBlockedOverlay: true
        });
        this.setState(newState, this.getArticles);
    };

    handleImportArticlesSubmit = () => {
        if (!this.isMounted) return;

        this.props.onSetAppProgress({ inProgress: true, withBlockedOverlay: true });
        this.setState({
            pagination: defaultPagination,
            filters: defaultFilters,
            articles: []
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
            if (!this.state.articles || !this.state.articles.length && !this.props.appProgress.inProgress) {
                this.getArticles();
            }
        });
    };

    handleCompleteArticles = (isComplete = true) => {
        const { userType } = this.state;
        const selectedArticles = this.getAllSelectedArticles();
        const selectedArticleIds = selectedArticles.map(({ id }) => id);

        if (userType && userType.slug) {
            const form = {
                articleIds: selectedArticleIds,
                properties: {
                    [`complete_${userType.slug}`]: isComplete
                }
            };

            ProjectService
                .updateMany(form, this.projectId)
                .then(() => {
                    this.handleClearSelected(true);
                    this.getArticles();
                })
                .finally(() => this.props.onSetAppProgress({ inProgress: false }));
        }
    };

    handleChangePage = ({ selected }) => {
        this.searchParams.set('page', (selected + 1).toString());
        this.props.onSetAppProgress({ inProgress: true, withBlockedOverlay: true });
        this.setState(state => {
            state.pagination.page = selected + 1;
            return state;
        }, this.getArticles);
    };

    handleChangeStatus = (selectedStatus) => {
        this.setState({ selectedStatus }, this.getArticles);
    };

    handleReplaceToArchive = () => {
        this.setState({ showArchiveModal: true });
    };

    handleArchivingArticle = (articleId) => {
        this.setState({ showArchiveModal: true, selectedArticleId: articleId });
    }

    handleChangeArticle = ({ value, prop, needSave }, articleIndex) => {
        this.setState(state => {
            state.articles[articleIndex][prop] = value;
            return state;
        }, () => {
            if (needSave) {
                this.saveArticle(articleIndex, prop);
            }
        });
    }

    handleChangeTableMode = (isEditMode) => {
        this.setState({ isEditMode });
    }

    getArticleColors = () => {
        ArticleService.color.get(this.projectId).then(response => {
            if (response.data) {
                store.dispatch(setArticleColors(response.data));
            }
        });
    };

    getArticles = () => {
        const { onSetAppProgress, appProgress } = this.props;
        const { pagination, filters, userType, selectedStatus } = this.state;
        const selectedColumns = getColumnsFromStorage(this.projectId);
        const fields = this.getFields();
        const statusValues = (selectedStatus || []).map(({ value }) => value);

        if (!userType) return;
        if (!appProgress.inProgress) {
            onSetAppProgress({ inProgress: true });
        }

        const form = {
            project: this.projectId,
            user_type: userType && userType.id || '',
            page: this.searchParams.get('page'),
            'per-page': pagination.perPage || 30,
            expand: fields
                .filter(({ slug }) => selectedColumns.find(({ key }) => key === slug))
                .map(field => field.relation || field.slug)
        };

        // Необходимые поля для корректной работы цветовыделения
        form.expand = [ ...form.expand, 'complete_monitor', 'complete_analytic', 'complete_client', 'user' ];

        // История передвижения статей
        form.expand = [ ...form.expand, 'usersManagers.user', 'usersManagers.fromUser' ];

        // Фильтрация по столбцам
        Object.keys(filters).forEach(filterKey => {
            const filter = filters[filterKey];
            const currentField = fields.find(({ slug }) => filterKey === 'sort'
                ? filter.type === slug
                : filterKey === slug
            );

            switch (filterKey) {
                case 'sort':
                    if (!filter.type) {
                        this.searchParams.delete('sort');
                        break;
                    }

                    form.sort = filter.type &&
                        `${filter.dir === SORT_DIR.ASC ? '-' : ''}${currentField?.relation || filter.type}`;
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

        // Фильтр Статусов
        if (statusValues.includes('open') && userType) {
            form[`query[complete_${userType.slug}]`] = false;
            form['query[user_id]'] = 'null';
        }

        if (statusValues.includes('complete') && userType) {
            form[`query[complete_${userType.slug}]`] = true;
        }

        if (statusValues.includes('user')) {
            form['query[user_id]'] = 'not null';
        }

        ArticleService
            .getList(form)
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

                QueueManager.remove(this.queueMessage.id);
                this.setSearchParams();

                this.setState({
                    articles: response.data,
                    pagination: responsePagination
                });
            })
            .finally(() => onSetAppProgress({ inProgress: false }));
    };

    getProject = (projectId) => {
        return ProjectService.get({ expand: 'projectFields,users', pageSize: 50 }, projectId).then(response => {
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

    saveArticle = (articleIndex, prop) => {
        const { userType, articles } = this.state;
        const article = articles[articleIndex];

        if (article && article[prop]) {
            const form = {
                [prop]: article[prop],
                project_id: this.projectId
            };

            this.props.onSetAppProgress({ inProgress: true });
            ArticleService
                .update(form, article.id, userType.id)
                .finally(() => {
                    this.props.onSetAppProgress({ inProgress: false });
                });
        }
    };

    onGetArticleMenu = (article, articleKey) => {
        const { filters, pagination } = this.state;

        const menuItems = [{
            title: 'Изменить',
            link: `/project/${this.projectId}/article/${article.id}`
        }];

        const sp = new URLSearchParams();
        const currentPage = this.searchParams.get('page') || pagination.page;
        const sortString = filters.sort.type &&
            `${filters.sort.dir === SORT_DIR.ASC ? '-' : ''}${filters.sort.type}`;
        let link = `/project/${this.projectId}/article/${article.id}?`;

        sp.set('search', filters.search);
        sp.set('sort', sortString || '');
        sp.set('position', articleKey);
        sp.set('page', currentPage);

        link += sp.toString();

        menuItems.unshift({
            title: 'Открыть',
            link
        });

        if (isProjectAccess([ PROJECT_PERMISSION.ACCESS_ARCHIVE ])) {
            menuItems.push({
                danger: true,
                title: 'В архив',
                onClick: () => this.props.onArchivingArticle(article.id)
            });
        }

        menuItems.push({
            danger: true,
            title: 'Удвлить',
            onClick: () => this.props.onDeleteArticle(article.id)
        });

        return menuItems;
    };

    searchParamsToFilters = (callback) => {
        this.setState(state => {
            for (const key of this.searchParams.keys()) {
                const value = this.searchParams.get(key);

                switch (key) {
                    case 'page':
                        break;
                    case 'sort':
                        state.filters.sort = {
                            dir: value.startsWith('-') ? SORT_DIR.ASC : SORT_DIR.DESC,
                            type: value.startsWith('-') ? value.substr(1, value.length) : value
                        };
                        break;
                    default:
                        state.filters[key] = value;
                }
            }

            return state;
        }, callback && callback);
    }

    queueMessage = { id: 'articles', text: 'Загрузка статей...' };

    projectId = this.props.match.params.id;

    addMenuItems = [ {
        title: 'Добавить новую',
        link: `/project/${this.projectId}/article`
    }, {
        title: 'Импорт статей',
        closeOnClick: true,
        onClick: () => this.setState({ showImportArticlesModal: true })
    } ];

    isMounted = true;

    searchParams = new URLSearchParams(this.props.location.search);

    render() {
        const {
            activeArticle,
            isAllArticlesSelected,
            filters,
            project,
            showArticleModal,
            pagination,
            showUploadArticlesModal,
            showImportArticlesModal,
            showTransferModal,
            showArchiveModal,
            userType,
            selectedStatus,
            selectedArticleId,
            saveArticleProgress,
            isEditMode
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

        return (
            <Page {...cls()} withBar>
                <Breadcrumbs location={this.props.location} />
                <section {...cls('title-wrapper')}>
                    <h2 {...cls('title')}>{_.get(project, 'name')}</h2>
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

                    {(hasSelectedItems && selectedArticles.some(item => !item[`complete_${userType.slug}`])) && (
                        <Button
                            {...cls('upload-btn')}
                            text='Завершить'
                            style='info'
                            onClick={() => this.handleCompleteArticles()}
                        />
                    )}

                    {(hasSelectedItems && selectedArticles.every(item => !!item[`complete_${userType.slug}`])) && (
                        <Button
                            {...cls('upload-btn')}
                            text='Отменить завершение'
                            style='info'
                            onClick={() => this.handleCompleteArticles(false)}
                        />
                    )}

                    {hasSelectedItems && (
                        <Button
                            {...cls('upload-btn')}
                            text='Передать'
                            style='info'
                            onClick={() => this.setState({ showTransferModal: true })}
                        />
                    )}

                    {hasSelectedItems && (
                        <AccessProject permissions={ PROJECT_PERMISSION.ACCESS_ARCHIVE }>
                            <Button
                                {...cls('upload-btn')}
                                text='В архив'
                                style='error'
                                onClick={this.handleReplaceToArchive}
                            />
                        </AccessProject>
                    )}
                </section>

                <section {...cls('filters')}>
                    <IconButton
                        {...cls('filter-item')}
                        iconComponent={<TrashIcon/>}
                        text='Удалить'
                        danger
                        disabled={!hasSelectedItems}
                        onClick={this.handleDeleteArticles}
                    />

                    <IconButton
                        {...cls('filter-item', '', 'd-none')}
                        iconComponent={<TrashIcon/>}
                        text='Дублировать'
                        disabled={!hasSelectedItems}
                    />

                    <IconButton
                        {...cls('filter-item', '', 'd-none')}
                        iconComponent={<ServicesIcon/>}
                        text='Сгруппировать'
                        disabled={!hasSelectedItems}
                    />

                    <IconButton
                        {...cls('filter-item', '', 'd-none')}
                        iconComponent={<StarIcon/>}
                        text='Добавить в избранное'
                        disabled={!hasSelectedItems}
                    />

                    {hasSelectedItems && (
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
                                    Выбрать все статьи в проекте
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
                        options={statusOptions}
                        onChange={this.handleChangeStatus}
                        selected={selectedStatus}
                        placeholder='Статус'
                    />


                    {saveArticleProgress ? (
                        <div { ...cls('article-load-wrapper') }>
                            <Loader
                                radius={10}
                                strokeWidth={3}
                            />
                        </div>
                    ) : (
                        <DropDownButton
                            {...cls('article-add-btn')}
                            buttonText='Добавить'
                            dropDownItems={this.addMenuItems}
                            dropDownRight
                        />
                    )}
                </section>

                <div {...cls('project-table-wrapper')}>
                    <ProjectTable
                        page={currentPage}
                        isAllSelected={isAllArticlesSelected}
                        filters={filters}
                        projectId={this.projectId}
                        selectedIds={(this.state.selectedArticles[pagination.page] || []).map(({ id }) => id)}
                        articles={articles}
                        pagination={pagination}
                        fields={fields}
                        userType={userType}
                        currentUserId={this.props.profile.id}
                        onChangeSelected={this.handleChangeSelected}
                        onSelectedAll={this.handleSelectAll}
                        onChangeColumns={this.handleChangeColumns}
                        onChangeSort={this.handleChangeSort}
                        onChangeArticle={this.handleChangeArticle}
                        onDeleteArticle={this.handleDeleteArticle}
                        onArchivingArticle={this.handleArchivingArticle}
                        onChangeFilter={this.handleChangeFilter}
                        onUpdateParent={() => this.getArticles()}
                        getArticleMenu={this.onGetArticleMenu}
                        onChangeTableMode={this.handleChangeTableMode}
                    />

                    <div {...cls('footer')}>
                        <ProjectPagination
                            page={currentPage}
                            pageCount={pagination.pageCount}
                            onPageChange={this.handleChangePage}
                        />

                        <span { ...cls('table-mode') }>
                            {isEditMode ? <FaEdit /> : <FaEye />}
                            Режим {isEditMode ? 'редактирования' : 'просмотра'}
                        </span>

                        <span {...cls('articles-count')}>
                            Всего {Plural(
                                pagination.totalCount || 0,
                                `${pagination.totalCount || 0} `,
                                [ 'статья', 'статьи', 'статей' ]
                            )}
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

                {showArchiveModal && (
                    <ArchiveModal
                        projectId={this.projectId}
                        onClose={() => this.setState({ showArchiveModal: false, selectedArticleId: null })}
                        articleIds={selectedArticleId ? [selectedArticleId] : selectedArticleIds}
                        isAll={isAllArticlesSelected}
                        onSubmit={() => {
                            this.setState({
                                selectedArticles: {},
                                selectedArticleId: null,
                                isAllArticlesSelected: false
                            }, this.getArticles);
                        }}
                    />
                )}

                <PromiseDialogModal ref={node => this.promiseDialogModal = node}/>

                {pagination.inProgress && <RightLoader/>}
            </Page>
        );
    }
}

function mapStateToProps(state) {
    return {
        profile: state.profile,
        appProgress: state.appProgress
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onSetAppProgress: (value) => dispatch(setAppProgress(value))
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectPage);
