import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ProjectTableHeader from './ProjectTableHeader/ProjectTableHeader';
import {SORT_DIR} from '../../../../constants';
import CheckBox from '../../../Form/CheckBox/CheckBox';
import DropDown from '../../../Shared/DropDown/DropDown';

import './project-table.scss';
import DropDownMenuIcon from '../../../Shared/SvgIcons/DropDownMenuIcon';

const classes = new Bem('project-table');

export default class ProjectTable extends Component {
    static propTypes = {
        className: PropTypes.string,
        articles: PropTypes.array,
        selectedIds: PropTypes.array,
        onChangeSelected: PropTypes.func,
        onDeleteArticle: PropTypes.func,
        onClickArticle: PropTypes.func
    };

    static defaultProps = {
        articles: [],
        selectedIds: [],
        onChangeSelected: () => {},
        onClickArticle: () => {}
    };

    state = {
        sort: {
            type: null,
            dir: null
        }
    };

    handleSelectAllArticles = (checked) => {
        this.props.onChangeSelected(
            checked ? this.props.articles.map(({id}) => id) : []
        );
    };

    handleChangeSort = (sortType) => {
        let {sort} = this.state;

        if (sort.type === sortType) {
            if (sort.dir === SORT_DIR.ASC) {
                sort = _.clone(this.defaultSort);
            }

            if (sort.dir === SORT_DIR.DESC) {
                sort.dir = SORT_DIR.ASC;
            }
        } else {
            sort.type = sortType;
            sort.dir = SORT_DIR.DESC;
        }

        this.setState({sort});
    };

    handleSelectArticle = (articleId) => {
        const {selectedIds} = this.props;

        let newSelected = [...selectedIds];

        if (newSelected.includes(articleId)) newSelected = newSelected.filter(id => id !== articleId);
        else newSelected.push(articleId);

        this.props.onChangeSelected(newSelected);
    };

    handleEditArticle = (article) => {
        console.log('edit article ', article);
    };

    handleDeleteArticle = (articleId) => {
        console.log('delete article ', articleId);
    };

    articleDropDown = {};

    defaultSort = {
        type: null,
        dir: null
    };

    renderRow = (article) => {
        const {selectedIds} = this.props;
        const menuItems = [{
            title: 'Изменить',
            onClick: () => this.handleEditArticle(article)
        }, {
            danger: true,
            title: 'Удвлить',
            onClick: () => this.props.onDeleteArticle(article.id)
        }];

        return (
            <div
                {...classes('row')}
                key={article.id}
                onClick={() => this.props.onClickArticle(article)}
            >
                <div {...classes('cell', 'check')}>
                    <CheckBox
                        checked={selectedIds.includes(article.id)}
                        onChange={() => this.handleSelectArticle(article.id)}
                    />
                </div>
                <div {...classes('cell', 'date')}>
                    <span {...classes('cell-text')}>
                        {moment(article.date).format('DD.MM.YYYY')}
                    </span>
                </div>
                <div {...classes('cell', 'source')}>
                    <span {...classes('cell-text')}>
                        {article.media}
                    </span>
                </div>
                <div {...classes('cell', 'title')}>
                    <span {...classes('cell-text')}>
                        {article.title}
                    </span>
                </div>
                <div {...classes('cell', 'annotation')}>
                    <span {...classes('cell-text')}>
                        {article.annotation}
                    </span>
                </div>

                <button
                    {...classes('menu-button')}
                    onClick={() => {
                        this.articleDropDown[article.id].toggle({style: {right: '10px'}});
                    }}
                >
                    <DropDownMenuIcon {...classes('menu-button-icon')}/>
                    <DropDown
                        items={menuItems}
                        ref={node => this.articleDropDown[article.id] = node}
                    />
                </button>
            </div>
        );
    };

    render() {
        const {className, articles, selectedIds} = this.props;
        const {sort} = this.state;

        return (
            <div {...classes('', '', className)}>
                <ProjectTableHeader
                    sort={sort}
                    onSelectAll={this.handleSelectAllArticles}
                    isAllSelected={articles.length && selectedIds.length === articles.length}
                    onChangeSort={this.handleChangeSort}
                />

                <section {...classes('body')}>
                    {articles.map(article => this.renderRow(article))}

                    {!articles.length && (
                        <div {...classes('empty-message')}>Статей пока нет</div>
                    )}
                </section>
            </div>
        );
    }
}
