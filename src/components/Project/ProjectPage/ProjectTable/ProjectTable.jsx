import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import {SORT_DIR} from '../../../../constants';
import CheckBox from '../../../Form/CheckBox/CheckBox';
import DropDown from '../../../Shared/DropDown/DropDown';
import './project-table.scss';
import './ProjectTableHeader/project-table-header.scss';
import DropDownMenuIcon from '../../../Shared/SvgIcons/DropDownMenuIcon';
import ProjectTableSettingsModal from './ProjectTableSettingsModal/ProjectTableSettingsModal';
import {DEFAULT_COLUMNS, COLUMN_TYPE, COLUMN_NAME, COLUMN_TYPE_SORT, getColumnsFromStorage} from './Columns';
import SettingsIcon from '../../../Shared/SvgIcons/SettingsIcon';
import SortArrow from './ProjectTableHeader/ProjectTableHeaderSortArrow';
import {InitScrollbar} from '../../../../helpers/Tools';

const classes = new Bem('project-table');
const headerClasses = new Bem('project-table-header');

export default class ProjectTable extends Component {
    static propTypes = {
        className: PropTypes.string,
        articles: PropTypes.array,
        selectedIds: PropTypes.array,
        onChangeSelected: PropTypes.func,
        onChangeSort: PropTypes.func,
        onChangeColumns: PropTypes.func.isRequired,
        onDeleteArticle: PropTypes.func,
        projectId: PropTypes.string.isRequired,
        pagination: PropTypes.object.isRequired,
        onScrollToEnd: PropTypes.func.isRequired
    };

    static defaultProps = {
        articles: [],
        selectedIds: [],
        onChangeSelected: () => {},
        onClickArticle: () => {}
    };

    constructor() {
        super();

        const storageColumns = getColumnsFromStorage();

        this.state = {
            columns: storageColumns || [...DEFAULT_COLUMNS],
            showColumnSettingsModal: false,
            sort: {
                type: null,
                dir: null
            }
        };
    }

    componentDidMount() {
        InitScrollbar(this.bodyRef);
    }

    componentDidUpdate = () => {
        this.setColumnWidth();
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

        this.setState({sort}, () => this.props.onChangeSort(sort));
    };

    handleSelectArticle = (articleId) => {
        const {selectedIds} = this.props;

        let newSelected = [...selectedIds];

        if (newSelected.includes(articleId)) newSelected = newSelected.filter(id => id !== articleId);
        else newSelected.push(articleId);

        this.props.onChangeSelected(newSelected);
    };

    handleClickColumnSettings = () => {
        this.setState({showColumnSettingsModal: true});
    };

    handleChangeColumns = (columns) => {
        this.setState({columns}, () => this.props.onChangeColumns(columns));
    };

    handleBodyScroll = (e) => {
        const {pagination, onScrollToEnd} = this.props;
        const isEndPage = e.target.scrollTop === e.target.scrollHeight - e.target.clientHeight;

        this.headerRef.scrollLeft = e.target.scrollLeft;

        if (isEndPage && pagination.page < pagination.pageCount) {
            onScrollToEnd(pagination.page + 1);
        }
    };

    getColumns = () => {
        return this.state.columns;
    };

    setColumnWidth = () => {
        const {columns} = this.state;

        columns.forEach(key => {
            const headerColumn = document.querySelector(`.project-table-header__cell--${key}`);
            const bodyColumns = document.querySelectorAll(`.project-table__cell--${key}`);

            if (headerColumn && bodyColumns) {
                bodyColumns.forEach(column => {
                    column.style.maxWidth = `${headerColumn.offsetWidth}px`;
                    column.style.minWidth = `${headerColumn.offsetWidth}px`;
                });
            }
        });
    };

    settingsMenu = [{
        id: 'set-columns',
        title: 'Настроить столбцы',
        onClick: this.handleClickColumnSettings
    }, {
        id: 'set-color',
        title: 'Цветовое выделение строк'
    }];

    articleDropDown = {};

    defaultSort = {
        type: null,
        dir: null
    };

    headerCellRef = {};

    renderHeader = () => {
        const {articles, selectedIds} = this.props;
        const {columns, sort} = this.state;

        return (
            <section {...headerClasses()} ref={node => this.headerRef = node}>
                <div {...headerClasses('cell', 'check')}>
                    <CheckBox
                        {...headerClasses('checkbox')}
                        onChange={checked => this.handleSelectAllArticles(checked)}
                        checked={articles.length && selectedIds.length === articles.length}
                    />
                </div>

                {columns.map(key => {
                    const active = sort.type === COLUMN_TYPE[key];

                    return (
                        <div
                            key={key}
                            ref={node => this.headerCellRef[key] = node}
                            {...headerClasses('cell', {[key]: true, active})}
                            onClick={() => this.handleChangeSort(COLUMN_TYPE_SORT[key])}
                        >
                            {COLUMN_NAME[key]}
                            {active && <SortArrow classes={headerClasses} dir={sort.dir}/>}
                        </div>
                    );
                })}
            </section>
        );
    };

    renderRow = (article) => {
        const {selectedIds, projectId} = this.props;
        const {columns} = this.state;
        const menuItems = [{
            title: 'Изменить',
            link: `/project/${projectId}/article/${article.id}`
        }, {
            danger: true,
            title: 'Удвлить',
            onClick: () => this.props.onDeleteArticle(article.id)
        }];

        return (
            <div
                {...classes('row')}
                key={article.id}
            >
                <div {...classes('cell', 'check')}>
                    <CheckBox
                        checked={selectedIds.includes(article.id)}
                        onChange={() => this.handleSelectArticle(article.id)}
                    />
                </div>

                {columns.map(key => {
                    return (
                        <Link
                            to={`/project/${projectId}/article/${article.id}`}
                            key={key}
                            {...classes('cell', key)}
                        >
                            <span {...classes('cell-text')}>
                                {key === 'date' && moment(article.date).format('DD.MM.YYYY')}
                                {key === 'source' && article.source && article.source.name}
                                {key === 'title' && article.title}
                                {key === 'annotation' && article.annotation}
                                {key === 'authors' && article.authors && article.authors.map(({name}) => name).join(', ')}
                                {key === 'city' && _.get(article, 'source.city.name')}
                                {key === 'region' && _.get(article, 'source.region.name')}
                                {key === 'federalDistrict' && _.get(article, 'source.federalDistrict.name')}
                                {key === 'typeSource' && _.get(article, 'source.type.name')}
                                {key === 'text' && article.text.replace(/<[^>]*>?/gm, '')}
                            </span>
                        </Link>
                    );
                })}

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
        const {className, articles} = this.props;
        const {showColumnSettingsModal} = this.state;

        return (
            <div {...classes('', '', className)}>
                {this.renderHeader()}

                <section
                    {...classes('body')}
                    ref={ref => this.bodyRef = ref}
                    onScroll={this.handleBodyScroll}
                >
                    {articles.map(article => this.renderRow(article))}

                    {!articles.length && (
                        <div {...classes('empty-message')}>Статей пока нет</div>
                    )}
                </section>

                <button
                    {...classes('settings-button')}
                    onClick={() => {
                        if (this.settingsMenuRef) {
                            this.settingsMenuRef.toggle({style: {right: '25px'}});
                        }
                    }}
                >
                    <SettingsIcon/>
                    <DropDown
                        ref={node => this.settingsMenuRef = node}
                        items={this.settingsMenu}
                    />
                </button>

                {showColumnSettingsModal && (
                    <ProjectTableSettingsModal
                        onChange={this.handleChangeColumns}
                        onClose={() => this.setState({showColumnSettingsModal: false})}
                    />
                )}
            </div>
        );
    }
}
