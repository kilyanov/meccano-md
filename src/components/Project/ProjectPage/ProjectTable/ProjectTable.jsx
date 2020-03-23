import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';
import {SORT_DIR, STORAGE_KEY} from '../../../../constants';
import CheckBox from '../../../Form/CheckBox/CheckBox';
import DropDown from '../../../Shared/DropDown/DropDown';
import './project-table.scss';
import './ProjectTableHeader/project-table-header.scss';
import DropDownMenuIcon from '../../../Shared/SvgIcons/DropDownMenuIcon';
import ProjectTableSettingsModal from './ProjectTableSettingsModal/ProjectTableSettingsModal';
import {getColumnsFromStorage, getColumnsFromFields, updateColumnWidth} from './Columns';
import SettingsIcon from '../../../Shared/SvgIcons/SettingsIcon';
import SortArrow from './ProjectTableHeader/ProjectTableHeaderSortArrow';
import {InitScrollbar} from '../../../../helpers/Tools';
import {FIELD_TYPE} from '../../../../constants/FieldType';
import ProjectTableColorModal from "./ProjectTableColorModal/ProjectTableColorModal";
import {StorageService} from "../../../../services";

const cls = new Bem('project-table');
const headerClasses = new Bem('project-table-header');
const LAST_ARTICLE_COLOR = '#f2f0f0';

class ProjectTable extends Component {
    static propTypes = {
        className: PropTypes.string,
        articles: PropTypes.array,
        selectedIds: PropTypes.array,
        onChangeSelected: PropTypes.func,
        sort: PropTypes.object,
        search: PropTypes.string,
        onChangeSort: PropTypes.func,
        onChangeColumns: PropTypes.func.isRequired,
        onDeleteArticle: PropTypes.func,
        projectId: PropTypes.string.isRequired,
        pagination: PropTypes.object.isRequired,
        onScrollToEnd: PropTypes.func.isRequired,
        fields: PropTypes.array.isRequired,
        isAllSelected: PropTypes.bool,
        articleColors: PropTypes.array,
        currentProject: PropTypes.object
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
        this.initScrollbar();
        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('mouseup', this.handleMouseUp);
    }

    componentDidUpdate = () => {
        this.initScrollbar();
        this.syncColumnWidth();
    };

    handleSelectAllArticles = (checked) => {
        this.props.onChangeSelected(
            checked ? this.props.articles.map(({id}) => id) : []
        );
    };

    handleChangeSort = (event, sortType) => {
        if (event.target && event.target.classList.contains('project-table-header__cell-handler')) {
            return;
        }

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

    handleMouseDown = (e, key) => {
        this.columnKey = key;
        this.element = e.target.parentNode;
        this.startX = e.pageX;
        this.startWidth = this.element.clientWidth;
        this.pressed = true;
    };

    handleMouseMove = (e) => {
        if (!this.pressed) return;

        this.diff = e.pageX - this.startX;
        this.element.style.flex = `0 0 ${this.startWidth + this.diff}px`;
        const bodyColumns = document.querySelectorAll(`.project-table__cell--${this.columnKey}`);

        bodyColumns.forEach(column => {
            column.style.maxWidth = `${this.startWidth + this.diff}px`;
            column.style.minWidth = `${this.startWidth + this.diff}px`;
        });
    };

    handleMouseUp = () => {
        this.pressed = false;
        this.element = null;
        this.startX = 0;
        this.startWidth = 0;
        this.columnKey = null;
        updateColumnWidth(this.props.projectId, this.columnKey, this.startWidth + this.diff);
    };

    getSettingMenu = () => {
        const { currentProject } = this.props;
        const settingsMenu = [{
            id: 'set-columns',
            title: 'Настроить столбцы',
            onClick: this.handleClickColumnSettings
        }, {
            id: 'edit-mode',
            title: 'Режим редактирования',
            onClick: () => console.log('Функционал еще не написан))')
        }];

        if (currentProject && currentProject.userProject) {
            const isProjectManager = currentProject.userProject.access_project_manager;

            if (isProjectManager) {
                settingsMenu.push({
                    id: 'set-color',
                    title: 'Цветовое выделение строк',
                    onClick: () => this.setState({showColorModal: true})
                });
            }
        }

        return settingsMenu;
    };

    articleDropDown = {};

    defaultSort = {
        type: null,
        dir: null
    };

    headerCellRef = {};

    selectedColumns = [];

    initScrollbar = () => {
        const scroll = InitScrollbar(this.bodyRef);

        if (scroll) this.scrollBar = scroll;
        else if (this.scrollBar) this.scrollBar.update();
    };

    syncColumnWidth = () => {
        this.selectedColumns.forEach(({key}) => {
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
                        checked={articles.length && selectedIds.length === articles.length || this.props.isAllSelected}
                    />
                </div>

                {this.selectedColumns.map(({key, width}) => {
                    const active = sort.type === key;
                    const currentField = fields.find(({slug}) => slug === key);

                    return (
                        <div
                            key={key}
                            ref={node => this.headerCellRef[key] = node}
                            {...headerClasses('cell', {[key]: true, active})}
                            onClick={event => this.handleChangeSort(event, key)}
                            style={width ? {flex: `0 0 ${width}px`} : {}}
                        >
                            {_.get(currentField, 'name')}
                            {active && <SortArrow classes={headerClasses} dir={sort.dir}/>}
                            <div
                                {...headerClasses('cell-handler')}
                                onMouseDown={event => this.handleMouseDown(event, key)}
                                onMouseMove={this.handleMouseMove}
                            />
                        </div>
                    );
                })}
            </section>
        );
    };

    renderArticle = (article, articleKey) => {
        const {selectedIds, projectId, fields, search, sort} = this.props;
        const lastViewedArticleId = StorageService.get(STORAGE_KEY.LAST_VIEWED_ARTICLE);
        const menuItems = [{
            title: 'Изменить',
            link: `/project/${projectId}/article/${article.id}`
        }, {
            danger: true,
            title: 'Удвлить',
            onClick: () => this.props.onDeleteArticle(article.id)
        }];
        const sortString = sort.type && `${sort.dir === SORT_DIR.ASC ? '-' : ''}${sort.type}`;
        const sp = new URLSearchParams();
        let url = `/project/${projectId}/article/${article.id}?`;
        let color = '';

        sp.set('search', search);
        sp.set('sort', sortString || '');
        sp.set('position', articleKey);

        url += sp.toString();

        ['complete_monitor', 'complete_analytic', 'complete_client'].some(key => {
            if (article[key]) {
                color = this.props.articleColors.find(({type}) => type === key);
            }

            return article[key];
        });

        return (
            <article
                {...cls('row')}
                key={`${article.id}-${articleKey}`}
                style={{
                    backgroundColor: lastViewedArticleId && lastViewedArticleId === article.id
                        ? LAST_ARTICLE_COLOR
                        : color && color.color
                            ? color.color
                            : null
                }}
            >
                <div {...cls('cell', 'check')}>
                    <CheckBox
                        checked={selectedIds.includes(article.id) || this.props.isAllSelected}
                        onChange={() => this.handleSelectArticle(article.id)}
                    />
                </div>

                {this.selectedColumns.map(({key}) => {
                    const currentField = fields.find(({slug}) => slug === key);
                    const relation = currentField && currentField.relation;

                    let columnValue = _.get(article, relation, article[key]);

                    if (currentField && currentField.type && currentField.type.key) {
                        switch (currentField.type.key) {
                            case FIELD_TYPE.ARRAY:
                                columnValue = (columnValue || []).map(c => c.name).join(', ');
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
                            to={url}
                            key={key}
                            {...cls('cell', key)}
                        >
                            <span {...cls('cell-text')}>{columnValue}</span>
                        </Link>
                    );
                })}

                <button
                    {...cls('menu-button')}
                    onClick={() => {
                        this.articleDropDown[article.id].toggle({style: {right: '10px'}});
                    }}
                >
                    <DropDownMenuIcon {...cls('menu-button-icon')}/>
                    <DropDown
                        items={menuItems}
                        ref={node => this.articleDropDown[article.id] = node}
                    />
                </button>
            </article>
        );
    };

    render() {
        const {className, articles, projectId, fields} = this.props;
        const {showColumnSettingsModal, showColorModal} = this.state;

        return (
            <div {...cls('', '', className)}>
                {this.renderHeader()}

                <section
                    {...cls('body')}
                    ref={ref => this.bodyRef = ref}
                    onScroll={this.handleBodyScroll}
                >
                    {articles.map((article, articleKey) => this.renderArticle(article, articleKey))}

                    {!articles.length && <div {...cls('empty-message')}>Статей пока нет</div>}
                </section>

                <button
                    {...cls('settings-button')}
                    onClick={() => {
                        if (this.settingsMenuRef) {
                            this.settingsMenuRef.toggle({style: {right: '25px'}});
                        }
                    }}
                >
                    <SettingsIcon/>
                    <DropDown
                        ref={node => this.settingsMenuRef = node}
                        items={this.getSettingMenu()}
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

                {showColorModal && (
                    <ProjectTableColorModal
                        onClose={() => this.setState({showColorModal: false})}
                        projectId={projectId}
                    />
                )}
            </div>
        );
    }
}

function mapStateToProps(store) {
    return {
        articleColors: store.articleColors,
        currentProject: store.currentProject
    };
}

export default connect(mapStateToProps)(ProjectTable);
