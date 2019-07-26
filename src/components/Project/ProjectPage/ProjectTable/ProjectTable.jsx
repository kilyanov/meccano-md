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
import {getColumnsFromStorage, getColumnsFromFields} from './Columns';
import SettingsIcon from '../../../Shared/SvgIcons/SettingsIcon';
import SortArrow from './ProjectTableHeader/ProjectTableHeaderSortArrow';
import {InitScrollbar} from '../../../../helpers/Tools';
import {FIELD_TYPE} from '../../../../constants/FieldType';

const classes = new Bem('project-table');
const headerClasses = new Bem('project-table-header');

export default class ProjectTable extends Component {
    static propTypes = {
        className: PropTypes.string,
        articles: PropTypes.array,
        selectedIds: PropTypes.array,
        onChangeSelected: PropTypes.func,
        sort: PropTypes.object,
        onChangeSort: PropTypes.func,
        onChangeColumns: PropTypes.func.isRequired,
        onDeleteArticle: PropTypes.func,
        projectId: PropTypes.string.isRequired,
        pagination: PropTypes.object.isRequired,
        onScrollToEnd: PropTypes.func.isRequired,
        fields: PropTypes.array.isRequired
    };

    static defaultProps = {
        articles: [],
        selectedIds: [],
        onChangeSelected: () => {},
        onClickArticle: () => {}
    };

    state = {
        showColumnSettingsModal: false
    };

    componentDidMount() {
        InitScrollbar(this.bodyRef);
    }

    componentDidUpdate = () => {
        InitScrollbar(this.bodyRef);
        this.setColumnWidth();
    };

    handleSelectAllArticles = (checked) => {
        this.props.onChangeSelected(
            checked ? this.props.articles.map(({id}) => id) : []
        );
    };

    handleChangeSort = (sortType) => {
        let {sort} = this.props;

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

        this.props.onChangeSort(sort);
        this.bodyRef.scrollTop = 0;
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

    handleChangeColumns = (selectedColumns) => {
        this.props.onChangeColumns(selectedColumns);
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
        return this.selectedColumns;
    };

    setColumnWidth = () => {
        this.selectedColumns.forEach(key => {
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

    selectedColumns = [];

    renderHeader = () => {
        const {articles, selectedIds, sort, fields, projectId} = this.props;
        const projectColumns = getColumnsFromFields(fields);

        this.selectedColumns = getColumnsFromStorage(projectId, projectColumns);

        return (
            <section {...headerClasses()} ref={node => this.headerRef = node}>
                <div {...headerClasses('cell', 'check')}>
                    <CheckBox
                        {...headerClasses('checkbox')}
                        onChange={checked => this.handleSelectAllArticles(checked)}
                        checked={articles.length && selectedIds.length === articles.length}
                    />
                </div>

                {this.selectedColumns.map(column => {
                    const active = sort.type === column;
                    const currentField = fields.find(({code}) => code === column);

                    return (
                        <div
                            key={column}
                            ref={node => this.headerCellRef[column] = node}
                            {...headerClasses('cell', {[column]: true, active})}
                            onClick={() => this.handleChangeSort(column)}
                        >
                            {_.get(currentField, 'name')}
                            {active && <SortArrow classes={headerClasses} dir={sort.dir}/>}
                        </div>
                    );
                })}
            </section>
        );
    };

    renderRow = (article) => {
        const {selectedIds, projectId, fields} = this.props;
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

                {this.selectedColumns.map(column => {
                    const currentField = fields.find(({code}) => code === column);
                    const relation = currentField && currentField.relation;

                    let columnValue = _.get(article, relation, article[column]);

                    if (currentField && currentField.type) {
                        switch (currentField.type) {
                            case FIELD_TYPE.ARRAY:
                                columnValue = (columnValue || []).map(({name}) => name).join(', ');
                                break;
                            case FIELD_TYPE.DATE:
                                columnValue = moment(columnValue).format('DD.MM.YYYY');
                                break;
                            case FIELD_TYPE.DATETIME:
                                columnValue = moment(columnValue).format('DD.MM.YYYY HH:mm');
                                break;
                            case FIELD_TYPE.TIME:
                                columnValue = moment(columnValue).format('HH:mm');
                                break;
                            case FIELD_TYPE.TEXT:
                                columnValue = columnValue && columnValue.replace(/<[^>]*>?/gm, '');
                                break;
                            default:
                                break;
                        }
                    }

                    return (
                        <Link
                            to={`/project/${projectId}/article/${article.id}`}
                            key={column}
                            {...classes('cell', column)}
                        >
                            <span {...classes('cell-text')}>{columnValue}</span>
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
        const {className, articles, projectId, fields} = this.props;
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
                        projectId={projectId}
                        projectFields={fields}
                    />
                )}
            </div>
        );
    }
}
