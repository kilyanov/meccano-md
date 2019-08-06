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
import ArticlesUploadModal from '../../Article/ArticlesUploadModal/ArticlesUploadModal';
import {ArticleService, ProjectService} from '../../../services';
import {NotificationManager} from 'react-notifications';
import DropDownButton from '../../Shared/DropDownButton/DropDownButton';
import ArticlesImportModal from '../../Article/ArticlesImportModal/ArticlesImportModal';
import Page from '../../Shared/Page/Page';
import Loader from '../../Shared/Loader/Loader';
import {SORT_DIR} from '../../../constants';
import RightLoader from '../../Shared/Loader/RightLoader/RightLoader';
import {Plural} from '../../../helpers/Tools';
import InlineButton from '../../Shared/InlineButton/InlineButton';

const classes = new Bem('project-page');
const defaultPagination = {page: 1, pageCount: 1, inProgress: false};
const defaultSort = {type: null, dir: null};
const defaultFilters = {search: '', sort: defaultSort};

export default class ProjectPage extends Component {
    state = {
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
        inProgress: true
    };

    componentDidMount() {
        this.getProject(this.projectId).then(this.getArticles);
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
                style: 'danger'
            }).then(() => {
                this.setState({inProgress: true}, () => {
                    ArticleService.delete([articleId], project.id)
                        .then(() => {
                            NotificationManager.success('Статья была успешно удалена', 'Удаление статьи');
                            this.setState({
                                articles: this.state.articles.filter(({id}) => id !== articleId)
                            });
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
                    ArticleService.delete(isAllArticlesSelected ? {all: true} : {ids: selectedItemIds}, project.id)
                        .then(() => {
                            NotificationManager.success('Выбранные статьи успешно удалены', 'Удаление');

                            this.setState({
                                articles: isAllArticlesSelected ? [] : articles.filter(({id}) => !selectedItemIds.includes(id)),
                                selectedItemIds: [],
                                isAllArticlesSelected: false,
                                inProgress: false
                            });
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
        const {inProgress, pagination} = this.state;

        if (!inProgress && !pagination.inProgress) {
            const newState = this.state;

            newState.pagination.page = page;
            newState.pagination.inProgress = true;

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

    getArticles = (isPagination = false) => {
        const {pagination, project, filters: {sort, search}} = this.state;
        const selectedColumns = this.projectTable.getColumns();
        const form = {
            project: this.projectId,
            page: pagination.page,
            expand: project.fields
                .filter(({code}) => selectedColumns.includes(code))
                .map(field => field.relation || field.code)
        };

        if (search) {
            project.fields
                .filter(({code}) => selectedColumns.includes(code))
                .forEach(field => {
                    form[`query[${field.relation || field.code}]`] = search;
                });
        }

        if (sort && sort.type) {
            const field = project.fields.find(({code}) => code === sort.type);

            form.sort = sort.type && `${sort.dir === SORT_DIR.ASC ? '-' : ''}${field.relation || sort.type}`;
        }

        ArticleService
            .getList(form)
            .then(response => {
                const responsePagination = {
                    pageCount: +_.get(response.headers, 'x-pagination-page-count'),
                    page: +_.get(response.headers, 'x-pagination-current-page'),
                    perPage: +_.get(response.headers, 'x-pagination-per-page'),
                    totalCount: +_.get(response.headers, 'x-pagination-total-count'),
                    inProgress: false
                };

                this.setState({
                    articles: isPagination ? this.state.articles.concat(response.data) : response.data,
                    pagination: responsePagination,
                    inProgress: false
                });
            })
            .catch(() => this.setState({inProgress: false}));
    };

    getProject = (projectId) => {
        return ProjectService.get({expand: 'fields'}, projectId).then(response => {
            return this.setState({project: response.data});
        });
    };

    projectId = this.props.match.params.id;

    addMenuItems = [{
        title: 'Добавить новую',
        link: `/project/${this.projectId}/article`
    }, {
        title: 'Импорт статей',
        closeOnClick: true,
        onClick: () => this.setState({showImportArticlesModal: true})
    }];

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
            inProgress
        } = this.state;
        const countSelected = isAllArticlesSelected ? pagination.totalCount : selectedItemIds.length;
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
                        danger
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
                        {...classes('filter-item', '', 'd-none')}
                        iconComponent={<ServicesIcon/>}
                        text='Сгруппировать'
                        disabled={!hasSelectedItems}
                    />

                    <IconButton
                        {...classes('filter-item', '', 'd-none')}
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
                                    {...classes('filter-item')}
                                    small
                                    onClick={() => this.setState({isAllArticlesSelected: true})}
                                >
                                    Выбрать все статьи в проекте
                                </InlineButton>
                            )}

                            <InlineButton
                                {...classes('filter-item')}
                                small
                                onClick={this.handleClearSelected}
                            >Снять выделение</InlineButton>
                        </Fragment>
                    )}

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
                        sort={filters.sort}
                        selectedIds={selectedItemIds}
                        isAllSelected={isAllArticlesSelected}
                        projectId={this.projectId}
                        articles={articles}
                        pagination={pagination}
                        onScrollToEnd={this.handleScrollToEndArticles}
                        fields={_.get(project, 'fields', [])}
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
                        onSubmit={this.handleImportArticlesSubmit}
                        projectId={this.projectId}
                    />
                )}

                <PromiseDialogModal ref={node => this.promiseDialogModal = node}/>

                {inProgress && <Loader fixed/>}

                {pagination.inProgress && <RightLoader/>}
            </Page>
        );
    }
}
