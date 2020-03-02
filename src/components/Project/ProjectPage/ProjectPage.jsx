import React, {Fragment, Component} from 'react';
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
import {ArticleService, ProjectService, StorageService} from '../../../services';
import {NotificationManager} from 'react-notifications';
import DropDownButton from '../../Shared/DropDownButton/DropDownButton';
import ArticlesImportModal from '../../Article/ArticlesImportModal/ArticlesImportModal';
import Page from '../../Shared/Page/Page';
import Loader from '../../Shared/Loader/Loader';
import {EVENTS, SORT_DIR, STORAGE_KEY} from '../../../constants';
import RightLoader from '../../Shared/Loader/RightLoader/RightLoader';
import {Plural, QueueManager} from '../../../helpers/Tools';
import InlineButton from '../../Shared/InlineButton/InlineButton';
import {EventEmitter} from "../../../helpers";
import store from "../../../redux/store";
import {setCurrentProject} from "../../../redux/actions/currentProject";
import {clearArticleColors, setArticleColors} from "../../../redux/actions/articleColors";
import {getColumnsFromStorage} from "./ProjectTable/Columns";
import ArticleTransferModal from "../../Article/ArticleTransferModal/ArticleTransferModal";

const cls = new Bem('project-page');
const defaultPagination = {page: 1, pageCount: 1};
const defaultSort = {type: null, dir: null};
const defaultFilters = {search: '', sort: defaultSort};

export default class ProjectPage extends Component {
    constructor(props) {
        super(props);

        const storageValue = StorageService.get(STORAGE_KEY.USER_TYPE);
        let userType = null;

        try {
            userType = JSON.parse(storageValue);
        } catch (e) {
            console.error(e);
        }

        this.state = {
            articles: [],
            activeArticle: null,
            selectedItemIds: [],
            isAllArticlesSelected: false,
            pagination: defaultPagination,
            project: null,
            filters: defaultFilters,
            showArticleModal: false,
            showUploadArticlesModal: false,
            showImportArticlesModal: false,
            showTransferModal: false,
            userType,
            inProgress: true
        };
    }

    componentDidMount() {
        this.getProject(this.projectId).then(this.getArticles);
        this.getArticleColors();
        EventEmitter.on(EVENTS.USER.CHANGE_TYPE, this.handleChangeUserType);
    }

    componentWillUnmount() {
        this.isMounted = false;
        EventEmitter.off(EVENTS.USER.CHANGE_TYPE, this.handleChangeUserType);
        store.dispatch(clearArticleColors());
    }

    handleChangeFilter = (filter, value) => {
        const newState = this.state;

        if (newState.filters.hasOwnProperty(filter)) {
            newState.filters[filter] = value;
        }

        this.setState(newState);
    };

    handleChangeSelected = (selectedItemIds) => {
        if (!selectedItemIds.length) this.handleClearSelected();
        else this.setState({selectedItemIds});
    };

    handleChangeColumns = () => {
        this.setState({inProgress: true}, this.getArticles);
    };

    handleDeleteArticle = (articleId) => {
        const {articles, project} = this.state;
        const article = articles.find(({id}) => id === articleId);

        if (articleId && article) {
            this.promiseDialogModal.open({
                title: 'Удаление статьи',
                content: `Вы уверены, что хотите удалить статью "${article.title}"?`,
                submitText: 'Удалить',
                danger: true
            }).then(() => {
                this.setState({inProgress: true}, () => {
                    ArticleService.delete({articleIds: [articleId]}, project.id)
                        .then(() => {
                            NotificationManager.success('Статья была успешно удалена', 'Удаление статьи');
                            this.setState({
                                articles: this.state.articles.filter(({id}) => id !== articleId),
                                inProgress: false
                            }, this.getTotalCountArticles);
                        })
                        .catch(() => this.setState({inProgress: false}));
                });
            });
        }
    };

    handleDeleteArticles = () => {
        const {articles, selectedItemIds, isAllArticlesSelected, pagination, project} = this.state;
        const countSelected = isAllArticlesSelected ? pagination.totalCount : selectedItemIds.length;

        if (countSelected) {
            this.promiseDialogModal.open({
                title: 'Удаление статей',
                content: `Вы уверены, что хотите удалить  ${Plural(
                    countSelected, 
                    `${countSelected} `,
                    ['статью', 'статьи', 'статей'])}?`,
                submitText: 'Удалить',
                style: 'danger'
            }).then(() => {
                this.setState({inProgress: true}, () => {
                    ArticleService.delete(isAllArticlesSelected ? {all: true} : {articleIds: selectedItemIds}, project.id)
                        .then(() => {
                            pagination.page = 1;
                            NotificationManager.success('Выбранные статьи успешно удалены', 'Удаление');

                            this.setState({
                                pagination,
                                articles: isAllArticlesSelected ? [] : articles.filter(({id}) => !selectedItemIds.includes(id)),
                                selectedItemIds: [],
                                isAllArticlesSelected: false
                            }, this.getArticles);
                        })
                        .catch(() => this.setState({inProgress: false}));
                });
            });
        }
    };

    handleCreateArticle = (article) => {
        const {articles} = this.state;

        articles.unshift(article);

        this.setState({articles});
    };

    handleUpdateArticle = (newArticle) => {
        this.setState({
            articles: this.state.articles.map(article =>
                (article.id === newArticle.id) ? newArticle : article
            )
        });
    };

    handleScrollToEndArticles = (page) => {
        const {inProgress} = this.state;

        if (!inProgress) {
            const newState = this.state;

            newState.pagination.page = page;

            QueueManager.push(this.queueMessage);
            this.setState(newState, () => this.getArticles(true));
        }
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
        this.setState({userType});
    };

    handleCompleteArticles = () => {
        const {selectedItemIds, userType} = this.state;

        if (userType && userType.slug) {
            const form = {
                articleIds: selectedItemIds,
                properties: {
                    [`complete_${userType.slug}`]: true
                }
            };

            this.setState({inProgress: true}, () => {
                ProjectService.updateMany(form, this.projectId).then(() => this.getArticles());
            });
        }
    };

    getArticleColors = () => {
        ArticleService.color.get(this.projectId).then(response => {
            if (response.data) {
                store.dispatch(setArticleColors(response.data));
            }
        });
    };

    getArticles = (isPagination = false) => {
        const {pagination, project, filters: {sort, search}, userType} = this.state;
        const selectedColumns = getColumnsFromStorage(this.projectId);
        const fields = this.getFields();

        const form = {
            project: this.projectId,
            user_type: userType && userType.id || '',
            page: pagination.page,
            expand: fields
                .filter(({slug}) => selectedColumns.find(({key}) => key === slug))
                .map(field => field.relation || field.slug)
        };

        form.expand = [...form.expand, 'complete_monitor', 'complete_analytic', 'complete_client'];

        if (search) {
            project.fields
                .filter(({slug}) => selectedColumns.includes(slug))
                .forEach(field => {
                    form[`query[${field.relation || field.slug}]`] = search;
                });
            this.searchParams.set('search', search);
        }

        if (sort && sort.type) {
            const field = project.fields.find(({slug}) => slug === sort.type);

            form.sort = sort.type && `${sort.dir === SORT_DIR.ASC ? '-' : ''}${field.relation || sort.type}`;
            this.searchParams.set('sort', `${sort.dir === SORT_DIR.ASC ? '-' : ''}${sort.type}`);
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

                QueueManager.remove(this.queueMessage.id);
                this.setSearchParams();

                this.setState({
                    articles: isPagination ? this.state.articles.concat(response.data) : response.data,
                    pagination: responsePagination,
                    inProgress: false
                });
            })
            .catch(() => this.setState({inProgress: false}));
    };

    getProject = (projectId) => {
        return ProjectService.get({expand: 'projectFields,users', pageSize: 50}, projectId).then(response => {
            store.dispatch(setCurrentProject(response.data));
            return this.setState({project: response.data});
        });
    };

    getFields = () => {
        const {project, userType} = this.state;

        if (!project || !project.projectFields || !project.projectFields.length) {
            return [];
        }

        const fields = project.projectFields.find(field => field.user_type_id === userType.id);

        if (fields && fields.data) {
            return fields.data;
        }
    };

    getTotalCountArticles = () => {
        ArticleService
            .getList({project: this.projectId})
            .then(response => {
                const newState = this.state;

                newState.pagination.totalCount = +_.get(response.headers, 'x-pagination-total-count');
                this.setState(newState);
            });
    };

    setSearchParams = () => {
        const {location, history} = this.props;

        location.search = this.searchParams.toString();
        history.replace(location);
    };

    queueMessage = {id: 'articles', text: 'Загрузка статей...'};

    projectId = this.props.match.params.id;

    addMenuItems = [{
        title: 'Добавить новую',
        link: `/project/${this.projectId}/article`
    }, {
        title: 'Импорт статей',
        closeOnClick: true,
        onClick: () => this.setState({showImportArticlesModal: true})
    }];

    isMounted = true;

    searchParams = new URLSearchParams(this.props.location.search);

    render() {
        const {
            activeArticle,
            selectedItemIds,
            isAllArticlesSelected,
            filters,
            project,
            showArticleModal,
            pagination,
            showUploadArticlesModal,
            showImportArticlesModal,
            showTransferModal,
            inProgress
        } = this.state;
        const countSelected = isAllArticlesSelected ? pagination.totalCount : selectedItemIds.length;
        const hasSelectedItems = !!selectedItemIds.length;
        const articles = _.cloneDeep(this.state.articles)
            .map(article => {
                article.date = new Date(article.date);

                return article;
            });
        const fields = this.getFields();

        return (
            <Page {...cls()} withBar>
                <section {...cls('title-wrapper')}>
                    <h2 {...cls('title')}>{_.get(project, 'name')}</h2>
                    {!!articles.length && (
                        <Button
                            {...cls('upload-btn')}
                            text={!countSelected || isAllArticlesSelected ? 'Выгрузить все' :
                                `Выгрузить ${Plural(
                                    countSelected, 
                                    `${countSelected} `,
                                    ['статью', 'статьи', 'статей']
                                )}`}
                            style='success'
                            onClick={() => this.setState({showUploadArticlesModal: true})}
                        />
                    )}

                    {hasSelectedItems && (
                        <Button
                            {...cls('upload-btn')}
                            text='Завершить'
                            style='info'
                            onClick={this.handleCompleteArticles}
                        />
                    )}

                    {hasSelectedItems && (
                        <Button
                            {...cls('upload-btn')}
                            text='Передать'
                            style='info'
                            onClick={() => this.setState({showTransferModal: true})}
                        />
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

                    {!!selectedItemIds.length && (
                        <Fragment>
                            <span>
                                {Plural(countSelected, '', ['Выбрана', 'Выбраны', 'Выбраны'])}
                                {Plural(
                                    countSelected,
                                    ` ${countSelected} `,
                                    ['статья', 'статьи', 'статей']
                                )}
                            </span>

                            {(countSelected < pagination.totalCount && !isAllArticlesSelected) && (
                                <InlineButton
                                    {...cls('filter-item')}
                                    small
                                    onClick={() => this.setState({isAllArticlesSelected: true})}
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

                    <span {...cls('articles-count')}>Всего статей: {pagination.totalCount || 0}</span>

                    <DropDownButton
                        {...cls('article-add-btn')}
                        buttonText='Добавить'
                        dropDownItems={this.addMenuItems}
                        dropDownRight
                    />
                </section>

                <div {...cls('project-table-wrapper')}>
                    <ProjectTable
                        onChangeSelected={this.handleChangeSelected}
                        onChangeColumns={this.handleChangeColumns}
                        onChangeSort={this.handleChangeSort}
                        onDeleteArticle={this.handleDeleteArticle}
                        sort={filters.sort}
                        search={filters.search}
                        selectedIds={selectedItemIds}
                        isAllSelected={isAllArticlesSelected}
                        projectId={this.projectId}
                        articles={articles}
                        pagination={pagination}
                        onScrollToEnd={this.handleScrollToEndArticles}
                        fields={fields}
                    />
                </div>

                {showArticleModal && (
                    <ArticleCreateModal
                        article={activeArticle || {}}
                        projectId={this.projectId}
                        onClose={() => this.setState({activeArticle: null, showArticleModal: false})}
                        onAddArticle={this.handleCreateArticle}
                        onUpdateArticle={this.handleUpdateArticle}
                    />
                )}

                {showUploadArticlesModal && (
                    <ArticlesExportModal
                        projectId={this.projectId}
                        selectedArticleIds={isAllArticlesSelected || selectedItemIds}
                        onUpdateParent={this.handleClearSelected}
                        onClose={() => this.setState({showUploadArticlesModal: false})}
                    />
                )}

                {showImportArticlesModal && (
                    <ArticlesImportModal
                        onClose={() => {
                            if (this.isMounted) this.setState({showImportArticlesModal: false});
                        }}
                        onSubmit={this.handleImportArticlesSubmit}
                        projectId={this.projectId}
                    />
                )}

                {showTransferModal && (
                    <ArticleTransferModal
                        onClose={() => this.setState({showTransferModal: false})}
                        projectId={this.projectId}
                        articleIds={selectedItemIds}
                    />
                )}

                <PromiseDialogModal ref={node => this.promiseDialogModal = node}/>

                {inProgress && <Loader fixed/>}

                {pagination.inProgress && <RightLoader/>}
            </Page>
        );
    }
}
