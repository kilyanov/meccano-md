import React, {Component} from 'react';
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

const classes = new Bem('project-page');

export default class ProjectPage extends Component {
    state = {
        selectedItemIds: [],
        /* eslint-disable */
        articles: [{
            id: 1,
            date: moment().format(),
            source: 'Finam.ru',
            title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce laoreet viverra nibh ac mollis. Suspendisse ligula neque, imperdiet eget quam in, sodales imperdiet mi. Sed vestibulum rhoncus finibus.',
            annotation: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce laoreet viverra nibh ac mollis. Suspendisse ligula neque, imperdiet eget quam in, sodales imperdiet mi. Sed vestibulum rhoncus finibus.'
        }, {
            id: 2,
            date: moment().format(),
            source: 'Finam.ru',
            title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce laoreet viverra nibh ac mollis. Suspendisse ligula neque, imperdiet eget quam in, sodales imperdiet mi. Sed vestibulum rhoncus finibus.',
            annotation: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce laoreet viverra nibh ac mollis. Suspendisse ligula neque, imperdiet eget quam in, sodales imperdiet mi. Sed vestibulum rhoncus finibus.'
        }, {
            id: 3,
            date: moment().format(),
            source: 'Skfo.ru',
            title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce laoreet viverra nibh ac mollis. Suspendisse ligula neque, imperdiet eget quam in, sodales imperdiet mi. Sed vestibulum rhoncus finibus.',
            annotation: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce laoreet viverra nibh ac mollis. Suspendisse ligula neque, imperdiet eget quam in, sodales imperdiet mi. Sed vestibulum rhoncus finibus.'
        }, {
            id: 4,
            date: moment().format(),
            source: 'Интерфакс',
            title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce laoreet viverra nibh ac mollis. Suspendisse ligula neque, imperdiet eget quam in, sodales imperdiet mi. Sed vestibulum rhoncus finibus.',
            annotation: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce laoreet viverra nibh ac mollis. Suspendisse ligula neque, imperdiet eget quam in, sodales imperdiet mi. Sed vestibulum rhoncus finibus.'
        }],
        /* eslint-enable */
        filters: {
            search: ''
        },
        showArticleModal: false,
        showUploadArticlesModal: false
    };

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
                this.setState({
                    articles: this.state.articles.filter(({id}) => !selectedItemIds.includes((id))),
                    selectedItemIds: []
                });
            });
        }
    };

    handleDeleteArticle = (itemId) => {
        const {articles} = this.state;
        const article = articles.find(({id}) => id === itemId);

        if (itemId && article) {
            this.promiseDialogModal.open({
                title: 'Удаление статьи',
                content: `Вы уверены, что хотите удалить статью "${article.title}"?`,
                submitText: 'Удалить',
                style: 'danger'
            }).then(() => {
                this.setState({
                    articles: articles.filter(({id}) => id !== itemId)
                });
            });
        }
    };

    handleAddArticle = () => {
        this.setState({
            showArticleModal: true
        });
    };

    render() {
        const {articles, selectedItemIds, filters, showArticleModal, showUploadArticlesModal} = this.state;
        const hasSelectedItems = !!selectedItemIds.length;

        return (
            <div {...classes('', '', 'page')}>
                <TopBar {...classes('top-bar')}/>

                <div {...classes('content', '', 'container')}>
                    <section {...classes('title-wrapper')}>
                        <h2 {...classes('title')}>Project Name</h2>
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
                            {...classes('filter-item')}
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

                        <Button
                            {...classes('article-add-btn')}
                            text='Добавить'
                            onClick={this.handleAddArticle}
                        />
                    </section>

                    <div {...classes('project-table-wrapper')}>
                        <ProjectTable
                            onChangeSelected={this.handleChangeSelected}
                            onDeleteArticle={this.handleDeleteArticle}
                            selectedIds={selectedItemIds}
                            articles={articles}
                        />
                    </div>

                    {showArticleModal && (
                        <ArticleCreateModal
                            onClose={() => this.setState({showArticleModal: false})}
                        />
                    )}

                    {showUploadArticlesModal && (
                        <ArticlesUploadModal
                            onClose={() => this.setState({showUploadArticlesModal: false})}
                        />
                    )}

                    <PromiseDialogModal ref={node => this.promiseDialogModal = node}/>
                </div>
            </div>
        );
    }
}
