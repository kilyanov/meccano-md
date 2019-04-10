import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import './project-page.scss';
import TopBar from '../../Shared/TopBar/TopBar';
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
import store from '../../../redux/store';
import { getArticlesByProject, deleteArticle } from '../../../redux/actions/article';
import { ArticleService } from '../../../services/ArticleService';
import { NotificationManager } from 'react-notifications';
import DropDownButton from '../../Shared/DropDownButton/DropDownButton';
import ArticlesImportModal from '../../Article/ArticlesImportModal/ArticlesImportModal';

const classes = new Bem('project-page');

class ProjectPage extends Component {
    static propTypes = {
        articles: PropTypes.array,
        projects: PropTypes.array
    };

    state = {
        activeArticle: null,
        selectedItemIds: [],
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
        const project = this.props.projects.find(({id}) => id === this.projectId);

        if (project) this.setProject(project);
        else this.getProject(this.projectId);

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
                    selectedItemIds.forEach(articleId => store.dispatch(deleteArticle(articleId)));
                    this.setState({selectedItemIds: []});
                });
            });
        }
    };

    handleDeleteArticle = (articleId) => {
        const {articles} = this.props;
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
                    store.dispatch(deleteArticle(articleId));
                });
            });
        }
    };

    handleClickArticle = (article) => {
        this.setState({
            activeArticle: article,
            showArticleModal: true
        });
    };

    handleAddArticle = () => {
        this.setState({
            showArticleModal: true
        });
    };

    getArticles = () => {
        const storeState = store.getState();
        const articles = storeState.articles.filter(({projectId}) => projectId === this.projectId);

        if (!articles.length) {
            store.dispatch(getArticlesByProject(this.projectId));
        }
    };

    getProject = (projectId) => {
        ProjectService.get(projectId).then(response => {
            this.setProject(response.data);
        });
    };

    setProject = (project) => {
        this.setState({
            project,
            inProgress: false
        });
    };

    projectId = this.props.match.params.id;

    addMenuItems = [{
        title: 'Добавить новую',
        onClick: this.handleAddArticle
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
            showUploadArticlesModal,
            showImportArticlesModal
        } = this.state;
        const hasSelectedItems = !!selectedItemIds.length;
        const articles = _.cloneDeep(this.props.articles)
            .filter(({projectId}) => projectId === this.projectId)
            .map(article => {
                article.date = new Date(article.date);

                return article;
            });

        return (
            <div {...classes('', '', 'page')}>
                <TopBar {...classes('top-bar')}/>

                <div {...classes('content', '', 'container')}>
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
                        />

                        <span {...classes('articles-count')}>Всего статей: 66</span>

                        <DropDownButton
                            {...classes('article-add-btn')}
                            buttonText='Добавить'
                            dropDownItems={this.addMenuItems}
                        />
                    </section>

                    <div {...classes('project-table-wrapper')}>
                        <ProjectTable
                            onClickArticle={this.handleClickArticle}
                            onChangeSelected={this.handleChangeSelected}
                            onDeleteArticle={this.handleDeleteArticle}
                            selectedIds={selectedItemIds}
                            articles={articles}
                        />
                    </div>

                    {showArticleModal && (
                        <ArticleCreateModal
                            article={activeArticle || {}}
                            projectId={this.projectId}
                            onClose={() => this.setState({activeArticle: null, showArticleModal: false})}
                        />
                    )}

                    {showUploadArticlesModal && (
                        <ArticlesUploadModal
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
                </div>
            </div>
        );
    }
}

export default connect(({projects, articles}) => ({
    articles,
    projects
}))(ProjectPage);
