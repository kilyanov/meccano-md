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
        }
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

    handleDeleteItems = () => {
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

    render() {
        const {articles, selectedItemIds, filters} = this.state;
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
                        />
                    </section>

                    <section {...classes('filters')}>
                        <IconButton
                            {...classes('filter-item')}
                            iconComponent={<TrashIcon/>}
                            text='Удалить'
                            disabled={!hasSelectedItems}
                            onClick={this.handleDeleteItems}
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
                        />
                    </section>

                    <ProjectTable
                        onChangeSelected={this.handleChangeSelected}
                        selectedIds={selectedItemIds}
                        articles={articles}
                    />

                    <PromiseDialogModal ref={node => this.promiseDialogModal = node}/>
                </div>
            </div>
        );
    }
}
