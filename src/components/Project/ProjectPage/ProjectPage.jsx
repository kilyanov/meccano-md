import React, {Component} from 'react';
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
import ArticlesUploadModal from '../../Article/ArticlesUploadModal/ArticlesUploadModal';
import { ProjectService } from '../../../services/ProjectService';
import { ArticleService } from '../../../services/ArticleService';
import { NotificationManager } from 'react-notifications';
import DropDownButton from '../../Shared/DropDownButton/DropDownButton';
import ArticlesImportModal from '../../Article/ArticlesImportModal/ArticlesImportModal';
import Page from '../../Shared/Page/Page';
import Loader from '../../Shared/Loader/Loader';
import {SORT_DIR} from '../../../constants';

const classes = new Bem('project-page');
const defaultPagination = {
    page: 1,
    pageCount: 1
};

export default class ProjectPage extends Component {
    state = {
        articles: [],
        activeArticle: null,
        selectedItemIds: [],
        pagination: defaultPagination,
        project: null,
        filters: {
            search: ''
        },
        showArticleModal: false,
        showUploadArticlesModal: false,
        showImportArticlesModal: false,
        inProgress: true
    };

    componentDidMount() {
        this.getProject(this.projectId);
        this.getArticles();
    }

    handleChangeFilter = (filter, value) => {
        const newState = this.state;

        if (newState.filters.hasOwnProperty(filter)) {
            newState.filters[filter] = value;
        }

        this.setState(newState);
    };

    handleChangeSelected = (selectedItemIds) => {
        this.setState({selectedItemIds});
    };

    handleDeleteArticles = () => {
        const {selectedItemIds} = this.state;

        if (selectedItemIds.length) {
            this.promiseDialogModal.open({
                title: 'Удаление статей',
                content: 'Вы уверены, что хотите удалить выделенные статьи?',
                submitText: 'Удалить',
                style: 'danger'
            }).then(() => {
                const requestStack = selectedItemIds.map(articleId => ArticleService.delete(articleId));

                Promise.all(requestStack).then(() => {
                    NotificationManager.success('Выбранные статьи успешно удалены', 'Успех');

                    this.setState({
                        articles: this.state.articles.filter(({id}) => !selectedItemIds.includes(id)),
                        selectedItemIds: []
                    });
                });
            });
        }
    };

    handleChangeColumns = () => {
        this.setState({inProgress: true}, this.getArticles);
    };

    handleDeleteArticle = (articleId) => {
        const {articles} = this.state;
        const article = articles.find(({id}) => id === articleId);

        if (articleId && article) {
            this.promiseDialogModal.open({
                title: 'Удаление статьи',
                content: `Вы уверены, что хотите удалить статью "${article.title}"?`,
                submitText: 'Удалить',
                style: 'danger'
            }).then(() => {
                ArticleService.delete(articleId).then(() => {
                    NotificationManager.success('Статья была успешно удалена', 'Успех');
                    this.setState({
                        articles: this.state.articles.filter(({id}) => id !== articleId)
                    });
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
            this.setState(prev => prev.pagination.page = page, () => this.getArticles(true));
        }
    };

    handleChangeSort = (sort) => {
        const newState = this.state;

        newState.filters.sort = sort.type && `${sort.dir === SORT_DIR.ASC ? '-' : ''}${sort.type}`;
        newState.articles = [];
        newState.pagination = defaultPagination;
        newState.inProgress = true;
        this.setState(newState, this.getArticles);
    };

    getArticles = (isPagination = false) => {
        const {pagination, filters} = this.state;
        const columns = this.projectTable.getColumns();
        const form = {
            project: this.projectId,
            page: pagination.page,
            expand: columns.join(',')
        };

        if (filters.search) {
            columns.forEach(columnName => {
                form[`query[${columnName}]`] = filters.search;
            });
        }

        if (filters.sort) form.sort = filters.sort;

        ArticleService
            .getList(form)
            .then(response => {
                const responsePagination = {
                    pageCount: +_.get(response.headers, 'x-pagination-page-count'),
                    page: +_.get(response.headers, 'x-pagination-current-page'),
                    perPage: +_.get(response.headers, 'x-pagination-per-page'),
                    totalCount: +_.get(response.headers, 'x-pagination-total-count')
                };

                this.setState({
                    articles: isPagination ? this.state.articles.concat(response.data) : response.data,
                    pagination: responsePagination,
                    inProgress: false
                });
            });
    };

    getProject = (projectId) => {
        ProjectService.get({expand: 'fields'}, projectId).then(response => {
            this.setState({project: response.data});
        });
    };

    projectId = this.props.match.params.id;

    addMenuItems = [{
        title: 'Добавить новую',
        link: `/project/${this.projectId}/article`
    }, {
        title: 'Импорт статей',
        onClick: () => this.setState({showImportArticlesModal: true})
    }];

    render() {
        const {
            activeArticle,
            selectedItemIds,
            filters,
            project,
            showArticleModal,
            pagination,
            showUploadArticlesModal,
            showImportArticlesModal,
            inProgress
        } = this.state;
        const hasSelectedItems = !!selectedItemIds.length;
        const articles = _.cloneDeep(this.state.articles)
            .map(article => {
                article.date = new Date(article.date);

                return article;
            });

        return (
            <Page {...classes()} withBar>
                <section {...classes('title-wrapper')}>
                    <h2 {...classes('title')}>{_.get(project, 'name')}</h2>
                    <Button
                        text='Выгрузить все'
                        {...classes('upload-btn')}
                        style='success'
                        onClick={() => this.setState({showUploadArticlesModal: true})}
                    />
                </section>

                <section {...classes('filters')}>
                    <IconButton
                        {...classes('filter-item')}
                        iconComponent={<TrashIcon/>}
                        text='Удалить'
                        disabled={!hasSelectedItems}
                        onClick={this.handleDeleteArticles}
                    />

                    <IconButton
                        {...classes('filter-item', '', 'd-none')}
                        iconComponent={<TrashIcon/>}
                        text='Дублировать'
                        disabled={!hasSelectedItems}
                    />

                    <IconButton
                        {...classes('filter-item')}
                        iconComponent={<ServicesIcon/>}
                        text='Сгруппировать'
                        disabled={!hasSelectedItems}
                    />

                    <IconButton
                        {...classes('filter-item')}
                        iconComponent={<StarIcon/>}
                        text='Добавить в избранное'
                        disabled={!hasSelectedItems}
                    />

                    <SearchFilter
                        {...classes('filter-item')}
                        placeholder='Найти'
                        value={filters.search}
                        onChange={value => this.handleChangeFilter('search', value)}
                        onSearch={() => this.getArticles()}
                    />

                    <span {...classes('articles-count')}>Всего статей: {pagination.totalCount || 0}</span>

                    <DropDownButton
                        {...classes('article-add-btn')}
                        buttonText='Добавить'
                        dropDownItems={this.addMenuItems}
                    />
                </section>

                <div {...classes('project-table-wrapper')}>
                    <ProjectTable
                        ref={ref => this.projectTable = ref}
                        onChangeSelected={this.handleChangeSelected}
                        onChangeColumns={this.handleChangeColumns}
                        onChangeSort={this.handleChangeSort}
                        onDeleteArticle={this.handleDeleteArticle}
                        selectedIds={selectedItemIds}
                        projectId={this.projectId}
                        articles={articles}
                        pagination={pagination}
                        onScrollToEnd={this.handleScrollToEndArticles}
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
                    <ArticlesUploadModal
                        projectId={this.projectId}
                        onClose={() => this.setState({showUploadArticlesModal: false})}
                    />
                )}

                {showImportArticlesModal && (
                    <ArticlesImportModal
                        onClose={() => this.setState({showImportArticlesModal: false})}
                        projectId={this.projectId}
                    />
                )}

                <PromiseDialogModal ref={node => this.promiseDialogModal = node}/>

                {inProgress && <Loader fixed/>}
            </Page>
        );
    }
}
