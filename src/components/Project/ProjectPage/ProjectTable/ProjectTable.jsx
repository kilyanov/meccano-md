import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { KEY_CODE, SORT_DIR, STORAGE_KEY, FIELD_TYPE } from '@const';
import CheckBox from '../../../Form/CheckBox/CheckBox';
import DropDown from '../../../Shared/DropDown/DropDown';
import './project-table.scss';
import './ProjectTableHeader/project-table-header.scss';
import DropDownMenuIcon from '../../../Shared/SvgIcons/DropDownMenuIcon';
import ProjectTableSettingsModal from './ProjectTableSettingsModal/ProjectTableSettingsModal';
import { getColumnsFromStorage, getColumnsFromFields, updateColumnWidth } from './Columns';
import SettingsIcon from '../../../Shared/SvgIcons/SettingsIcon';
import SortArrow from './ProjectTableHeader/ProjectTableHeaderSortArrow';
import ProjectTableColorModal from "./ProjectTableColorModal/ProjectTableColorModal";
import { StorageService } from "@services";
import ArticleMovementHistory from "../../../Article/ArticleMovementHistory/ArticleMovementHistory";
import ProjectTableEditableCell from './ProjectTableEditableCell/ProjectTableEditableCell';
import FocusHelper from './FocusHelper';
import CompareIcon from '../../../Shared/SvgIcons/CompareIcon';
import Tooltip from '../../../Shared/Tooltip/Tooltip';

const cls = new Bem('project-table');
const headerClasses = new Bem('project-table-header');

class ProjectTable extends Component {
    static propTypes = {
        className: PropTypes.string,
        articles: PropTypes.array,
        selectedIds: PropTypes.array,
        onChangeSelected: PropTypes.func,
        filter: PropTypes.object,
        onChangeSort: PropTypes.func,
        onChangeColumns: PropTypes.func.isRequired,
        onDeleteArticle: PropTypes.func,
        onArchivingArticle: PropTypes.func,
        archiveId: PropTypes.string,
        projectId: PropTypes.string.isRequired,
        pagination: PropTypes.object.isRequired,
        fields: PropTypes.array.isRequired,
        isAllSelected: PropTypes.bool,
        articleColors: PropTypes.array,
        currentProject: PropTypes.object,
        onChangeFilter: PropTypes.func,
        getArticleMenu: PropTypes.func.isRequired,
        currentUserId: PropTypes.string,
        comparedArticles: PropTypes.object
    };

    static defaultProps = {
        articles: [],
        selectedIds: [],
        onChangeSelected: () => {},
        onClickArticle: () => {}
    };

    state = {
        filters: {},
        showColumnSettingsModal: false,
        editableMode: false
    };

    componentDidMount() {
        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('mouseup', this.handleMouseUp);
        document.addEventListener('mousedown', this.handleDocumentKeyPress);
    }

    componentDidUpdate = () => {
        console.log(this.props.comparedArticles);
        this.syncColumnWidth();
        this.focusHelper = new FocusHelper();
    };

    componentWillUnmount() {
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.handleMouseUp);
        document.removeEventListener('mousedown', this.handleDocumentKeyPress);
    }

    handleSelectAllArticles = (checked) => {
        this.props.onSelectedAll({
            articleIds: this.props.articles.map(({ id }) => id),
            checked
        });
    };

    handleChangeSort = (event, sortType) => {
        if (event.target && event.target.classList.contains('project-table-header__cell-handler')) {
            return;
        }

        let { filters: { sort } } = this.props;

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

    handleSelectArticle = (articleId, isSelected, currentArticleIndex) => {
        const { selectedIds } = this.props;

        let newSelected = [ ...selectedIds ];

        if (isSelected) {
            newSelected.push(articleId);
        } else {
            newSelected = newSelected.filter(id => id !== articleId);
        }

        if (!this.pressedShiftKey && isSelected) {
            this.startIndex = currentArticleIndex;
            this.endIndex = null;
        }

        if (this.pressedShiftKey) {
            if (this.endIndex === null) {
                this.endIndex = currentArticleIndex;
                newSelected = this.selectRange(true, newSelected);
            } else {
                newSelected = this.selectRange(false, newSelected);
                this.endIndex = currentArticleIndex;
                newSelected = this.selectRange(true, newSelected);
            }
        }

        this.props.onChangeSelected({ articleIds: newSelected });
    };

    handleClickColumnSettings = () => {
        this.setState({ showColumnSettingsModal: true });
    };

    handleChangeColumns = (selectedColumns) => {
        this.props.onChangeColumns(selectedColumns);
    };

    handleBodyScroll = (e) => {
        const { pagination, onScrollToEnd } = this.props;
        const isStartPage = e.target.scrollTop === 0;
        const isEndPage = e.target.scrollTop === e.target.scrollHeight - e.target.clientHeight;

        this.headerRef.scrollLeft = e.target.scrollLeft;

        if (isEndPage && pagination.page < pagination.pageCount) {
            onScrollToEnd(pagination.page + 1);
        }

        if (isStartPage && pagination.page > 1) {
            onScrollToEnd(pagination.page - 1);
        }
    };

    handleMouseDown = (e, key) => {
        this.columnKey = key;
        this.element = e.target.parentNode.parentNode;
        this.startX = e.pageX;
        this.startWidth = this.element.clientWidth;
        this.pressed = true;
    };

    handleMouseMove = (e) => {
        if (!this.pressed) return;

        this.diff = e.pageX - this.startX;
        // this.element.style.flex = `0 0 ${this.startWidth + this.diff}px`;
        this.element.style.maxWidth = `${this.startWidth + this.diff}px`;
        this.element.style.minWidth = `${this.startWidth + this.diff}px`;
        const bodyColumns = document.querySelectorAll(`.project-table__cell--${this.columnKey}`);

        bodyColumns.forEach(column => {
            column.style.maxWidth = `${this.startWidth + this.diff}px`;
            column.style.minWidth = `${this.startWidth + this.diff}px`;
        });
    };

    handleMouseUp = () => {
        updateColumnWidth(this.props.projectId, this.columnKey, this.startWidth + this.diff);
        this.pressed = false;
        this.element = null;
        this.startX = 0;
        this.startWidth = 0;
        this.columnKey = null;
    };

    handleChangeArticle = (values, articleKey, article) => {
        this.props.onChangeArticle(values, articleKey, article);
        this.focusHelper.focusNext(values.ref);
    }

    handleDocumentKeyPress = (event) => {
        this.pressedShiftKey = event.shiftKey;
    }

    getSettingMenu = () => {
        const { currentProject } = this.props;
        const { editableMode } = this.state;
        const settingsMenu = [
            {
                id: 'set-columns',
                title: 'Параметры таблицы',
                onClick: this.handleClickColumnSettings
            },
            {
                id: 'edit-mode',
                title: editableMode ? 'Режим просмотра' : 'Режим редактирования',
                onClick: () => {
                    this.setState(state => {
                        state.editableMode = !state.editableMode;
                        this.props.onChangeTableMode(state.editableMode);
                        return state;
                    });
                }
            }
        ];

        if (currentProject && currentProject.userProject) {
            const isProjectManager = currentProject.userProject.access_project_manager;

            if (isProjectManager) {
                settingsMenu.push({
                    id: 'set-color',
                    title: 'Цветовое выделение строк',
                    onClick: () => this.setState({ showColorModal: true })
                });
            }
        }

        return settingsMenu;
    };

    selectRange = (checked, selected) => {
        const { articles } = this.props;
        let newSelected = [ ...selected ];

        const sIndex = this.startIndex < this.endIndex
            ? this.startIndex + 1
            : this.endIndex;
        const eIndex = this.startIndex < this.endIndex
            ? this.endIndex + 1
            : this.startIndex;

        const processArticles = articles.slice(sIndex, eIndex).map(({ id }) => id);

        if (checked) {
            newSelected = [ ...newSelected, ...processArticles ];
        } else {
            newSelected = newSelected.filter(id => !processArticles.includes(id));
        }

        return newSelected;
    }

    startIndex = null

    endIndex = null

    articleDropDown = {};

    defaultSort = {
        type: null,
        dir: null
    };

    headerCellRef = {};

    selectedColumns = [];

    syncColumnWidth = () => {
        this.selectedColumns.forEach(({ key }) => {
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

    _debouncedUpdateParent = _.debounce(this.props.onUpdateParent, 700)

    renderHeader = () => {
        const { articles, selectedIds, filters, fields, projectId } = this.props;
        const { sort } = filters;
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

                <div {...headerClasses('cell', 'compare')}>
                    <CompareIcon {...headerClasses('compare-icon')} />
                </div>

                {this.selectedColumns.map(({ key, width }) => {
                    const active = sort.type === key;
                    const currentField = fields.find(({ slug }) => slug === key);
                    const fieldType = currentField && currentField.type;

                    return (
                        <div
                            key={key}
                            {...headerClasses('cell', { [key]: true, active })}
                            ref={node => this.headerCellRef[key] = node}
                            style={width ? { minWidth: `${width}px`, maxWidth: `${width}px` } : {}}
                        >
                            <div {...headerClasses('cell-content')}>
                                <span
                                    {...headerClasses('cell-name')}
                                    onClick={event => this.handleChangeSort(event, key)}
                                >
                                    {_.get(currentField, 'name')}
                                    {active && <SortArrow classes={headerClasses} dir={sort.dir}/>}
                                </span>
                                <div
                                    {...headerClasses('cell-handler')}
                                    onMouseDown={event => this.handleMouseDown(event, key)}
                                    onMouseMove={this.handleMouseMove}
                                />
                            </div>

                            {this.renderFilter(fieldType, currentField)}
                        </div>
                    );
                })}
            </section>
        );
    };

    renderFilter = (fieldType, currentField) => {
        const { filters } = this.props;
        if (!fieldType || !fieldType.key) return;
        let field;
        const clearValue = (val) => val.trim().toLowerCase();

        switch (fieldType.key) {
            case 'datetime':
                field =
                    <input
                        {...headerClasses('cell-filter-field')}
                        type="date"
                        defaultValue={ filters[currentField.slug] || '' }
                        onKeyDown={({ keyCode, target: { value } }) => {
                            if (keyCode === KEY_CODE.enter) {
                                this.props.onChangeFilter(currentField.slug, value);
                                setTimeout(this.props.onUpdateParent, 0);
                            }
                        }}
                    />;
                break;
            default:
                field =
                    <input
                        {...headerClasses('cell-filter-field')}
                        placeholder='Поиск...'
                        type="search"
                        defaultValue={ filters[currentField.slug] || '' }
                        onChange={({ target: { value } }) => {
                            this.props.onChangeFilter(currentField.slug, clearValue(value));
                            this._debouncedUpdateParent();
                        }}
                    />;
        }

        return (
            <div {...headerClasses('cell-filter')}>
                {field}
            </div>
        );
    };

    renderArticle = (article, articleIndex) => {
        const {
            selectedIds,
            projectId,
            fields,
            filters,
            profile,
            page,
            archiveId,
            userType
        } = this.props;
        const { search, sort } = filters;
        const { editableMode } = this.state;
        const lastViewedArticleId = StorageService.get(STORAGE_KEY.LAST_VIEWED_ARTICLE);
        const sortString = sort.type && `${sort.dir === SORT_DIR.ASC ? '-' : ''}${sort.type}`;
        const sp = new URLSearchParams();
        let url = archiveId
            ? `/archive/${archiveId}/article/${article.id}?`
            : `/project/${projectId}/article/${article.id}?`;
        let color = '';
        const menuItems = this.props.getArticleMenu(article, articleIndex);

        sp.set('search', search);
        sp.set('sort', sortString || '');
        sp.set('position', articleIndex);
        sp.set('page', page);

        url += sp.toString();

        // Подсветка ответственных (кому передана статья)еку
        if (article.user && article.user.id !== profile?.id && this.props.articleColors) {
            color = this.props.articleColors.find(({ type }) => type === 'responsible');
        }

        [ 'complete_monitor', 'complete_analytic', 'complete_client' ].some(key => {
            if (article.hasOwnProperty(key) && article[key] && this.props.articleColors) {
                color = this.props.articleColors.find(({ type }) => type === key);
            }

            return article[key];
        });

        return (
            <article
                {...cls('row', { last: lastViewedArticleId && lastViewedArticleId === article.id })}
                key={`${article.id}-${articleIndex}`}
                style={{
                    backgroundColor: color && color.color
                        ? color.color
                        : null
                }}
            >
                <div {...cls('cell', 'check')}>
                    <CheckBox
                        checked={selectedIds.includes(article.id) || this.props.isAllSelected}
                        onChange={(event) => this.handleSelectArticle(article.id, event, articleIndex)}
                    />
                </div>

                <div {...cls('cell', 'compare')}>
                    {!!this.props.comparedArticles?.[article.id] && (
                        <Tooltip
                            {...cls('compare-tooltip')}
                            isOpen
                            target={(<CompareIcon {...cls('compare-icon')} />)}
                            content={(<div {...cls('compare-info')}>
                                Найдены дубликаты: {this.props.comparedArticles?.[article.id].length}
                            </div>)}
                            position="right"
                        />
                    )}
                </div>

                {this.selectedColumns.map(({ key }) => {
                    const currentField = fields.find(({ slug }) => slug === key);
                    const relation = currentField && currentField.relation;
                    const isUserId = currentField && currentField.slug === 'user_id';

                    let columnValue = _.get(article, relation, article[key]);

                    if (currentField?.type?.key) {
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

                    const lastMoving = article.usersManagers?.[article.usersManagers.length - 1];
                    const Wrapper = editableMode ? 'div' : Link;

                    return (
                        <Wrapper
                            to={url}
                            key={key}
                            {...cls('cell', key)}
                        >
                            { isUserId && (
                                <ArticleMovementHistory
                                    articleId={ article.id }
                                    usersManagers={article.usersManagers}
                                    userType={userType}
                                >
                                    {
                                        lastMoving && lastMoving?.user?.id === this.props.currentUserId
                                            ?  lastMoving.fromUser
                                                ? <span>от <b>{ getUserName(lastMoving.fromUser) }</b></span>
                                                : <span>кому <b>{ getUserName(lastMoving.user) }</b></span>
                                            : columnValue && <span>кому <b>{columnValue}</b></span>
                                    }
                                </ArticleMovementHistory>
                            ) }

                            { (!isUserId && editableMode) && (
                                <ProjectTableEditableCell
                                    field={currentField}
                                    article={article}
                                    columnValue={columnValue}
                                    onChange={values =>
                                        this.handleChangeArticle(values, articleIndex, article)
                                    }
                                />
                            ) }

                            {(!isUserId && !editableMode) && (
                                <span {...cls('cell-text')}>{ columnValue }</span>
                            )}
                        </Wrapper>
                    );
                })}

                <button
                    {...cls('menu-button')}
                    onClick={() => {
                        this.articleDropDown[article.id].toggle({ style: { right: '10px' } });
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
        const { className, articles, projectId, fields } = this.props;
        const { showColumnSettingsModal, showColorModal } = this.state;

        return (
            <div {...cls('', '', className)}>
                {this.renderHeader()}

                <section
                    {...cls('body')}
                    ref={ref => this.bodyRef = ref}
                >
                    {articles.map((article, articleKey) => this.renderArticle(article, articleKey))}

                    {!articles.length && <div {...cls('empty-message')}>Статей пока нет</div>}
                </section>

                <button
                    {...cls('settings-button')}
                    onClick={() => {
                        if (this.settingsMenuRef) {
                            this.settingsMenuRef.toggle({ style: { right: '25px' } });
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
                        onClose={() => this.setState({ showColumnSettingsModal: false })}
                        projectId={projectId}
                        projectFields={fields}
                    />
                )}

                {showColorModal && (
                    <ProjectTableColorModal
                        onClose={() => this.setState({ showColorModal: false })}
                        projectId={projectId}
                    />
                )}
            </div>
        );
    }
}

function getUserName(user) {
    return (user.surname || user.name)
        ? `${user.surname} ${user.name}`
        : user.email;
}

const mapStateToProps = (state) => ({
    articleColors: state.articleColors,
    currentProject: state.currentProject,
    profile: state.profile
});

export default connect(mapStateToProps)(ProjectTable);
