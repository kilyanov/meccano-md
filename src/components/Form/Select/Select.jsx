import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './select.scss';
import {InitScrollbar, isMobileScreen} from '../../../helpers/Tools';
import CheckBox from '../CheckBox/CheckBox';
import {KEY_CODE, EVENTS} from '../../../constants';
import Loader from '../../Shared/Loader/Loader';
import {EventEmitter} from '../../../helpers';

const cls = new Bem('select');

export default class Select extends Component {
    static propTypes = {
        selected: PropTypes.oneOfType([
            PropTypes.object,
            PropTypes.array,
            PropTypes.string,
            PropTypes.instanceOf(undefined)
        ]),
        options: PropTypes.array,
        placeholder: PropTypes.string,
        onChange: PropTypes.func,
        onSearch: PropTypes.func,
        onCancelSearch: PropTypes.func,
        label: PropTypes.string,
        required: PropTypes.bool,
        withSearch: PropTypes.bool,
        fixedPosList: PropTypes.bool,
        requestService: PropTypes.func,
        requestCancelService: PropTypes.func,
        validateErrorMessage: PropTypes.string,
        canAddNewValue: PropTypes.bool,
        depended: PropTypes.array // Зависимый фильтр (вставляется в форму запроса)
    };

    static defaultProps = {
        placeholder: 'Выберите из списка...',
        validateErrorMessage: 'Поле обязательно для заполнения',
        options: []
    };

    state = {
        error: false,
        opened: false,
        searchOptions: [],
        searchString: '',
        pagination: {
            page: 1,
            perPage: 10
        },
        inProgress: !!this.props.requestService && !this.props.depended
    };

    componentDidMount() {
        if (this.props.requestService) {
            this.getList();
        }

        document.addEventListener('click', this.handleClickOutside, true);
        EventEmitter.on(EVENTS.FORM.ON_VALIDATE, this.validate);
        this.initScrollBar();
    }

    componentDidUpdate(prevProps) {
        const options = this.getOptions();

        if (this.props.selected !== prevProps.selected && options.length) {
            this.checkSelected();
        }

        if (this.props.depended && !_.isEqual(this.props.depended, prevProps.depended)) {
            this.setState({
                inProgress: true,
                options: null
            }, () => {
                this.props.onChange(this.isMultiple ? [] : '');
                this.getList();
            });
        }

        this.initScrollBar();
    }

    componentWillUnmount() {
        this.isMount = false;
        document.removeEventListener('click', this.handleClickOutside, true);
        EventEmitter.off(EVENTS.FORM.ON_VALIDATE, this.validate);
    }

    handleClickOutside = (event) => {
        const isInnerClick = this.domNode && this.domNode.contains(event.target);

        if (!isInnerClick && this.state.opened) {
            this.close();
        }
    };

    handleListScroll = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const {target} = event;
        const {pagination, inProgress} = this.state;
        const isEndPage = target.scrollTop === target.scrollHeight - target.clientHeight;

        if (
            isEndPage &&
            !inProgress &&
            pagination.page < pagination.pageCount
        ) {
            const newState = this.state;

            newState.pagination.page = newState.pagination.page + 1;
            newState.inProgress = true;

            this.setState(newState, () => this.getList(true));
        }
    };

    handleSelect = (item) => {
        let selected = _.clone(this.props.selected);

        if (this.isMultiple && selected) {
            if (selected.find(({value}) => value === item.value)) {
                selected = selected.filter(({value}) => value !== item.value);
            } else {
                selected.push(item);
            }
        } else this.close();

        this.setState({searchString: '', error: false});

        return this.props.onChange(this.isMultiple ? selected : item);
    };

    handleSearch = (event) => {
        const value = event.target.value.trim().toLowerCase();

        if (this.props.requestService) {
            this.setState({
                searchString: event.target.value
            }, () => {
                if (value) this.debouncedSearch(value);
                else this.setState({inProgress: false, searchOptions: []});
            });
        } else {
            const searchOptions = this.props.options.filter(({name}) => name.toLowerCase().includes(value));

            this.setState({
                searchString: event.target.value,
                searchOptions: !!value && searchOptions ? searchOptions : []
            });
        }
    };

    handleSearchFocus = () => {
        this.setState({searchFocused: true});
    };

    handleSearchBlur = (event) => {
        this.submitNewItem(event);
    };

    handleSearchKeyDown = (event) => {
        switch (event.keyCode) {
            case KEY_CODE.arrows.down:
                if (!this.listRef) return;
                this.listRef.querySelector('li:first-child').focus();
                event.preventDefault();
                break;
            case KEY_CODE.arrows.up:
                if (!this.listRef) return;
                this.listRef.querySelector('li:last-child').focus();
                event.preventDefault();
                break;
            case KEY_CODE.enter:
                this.submitNewItem(event);
                event.preventDefault();
                break;
            case KEY_CODE.esc:
                this.close();
                break;
            default:
                break;
        }
    };

    handleClearValue = () => {
        const {canAddNewValue} = this.props;
        const newState = this.state;
        const options = this.getOptions();
        const selected = _.isString(this.props.selected) &&
            options.find(({value}) => value === this.props.selected) || this.props.selected;

        if (canAddNewValue && selected.isNew) {
            newState.options = newState.options.filter(option => !option.isNew);
        }

        this.setState({searchString: ''});
        this.props.onChange(this.isMultiple ? [] : {});
    };

    handleListKeyDown = (event) => {
        const focused = this.listRef.querySelector('li:focus');
        const options = this.getOptions();

        event.preventDefault();

        switch (event.keyCode) {
            case KEY_CODE.arrows.down:
                if (focused && focused.nextElementSibling && focused.nextElementSibling.tagName === 'LI') {
                    focused.nextElementSibling.focus();
                } else {
                    this.listRef.querySelector('li:first-of-type').focus();
                }
                break;
            case KEY_CODE.arrows.up:
                if (focused && focused.previousElementSibling) {
                    focused.previousElementSibling.focus();
                } else {
                    this.listRef.querySelector('li:last-of-type').focus();
                }
                break;
            case KEY_CODE.space:
            case KEY_CODE.enter:
                this.handleSelect(options[focused.getAttribute('data-index')]);
                break;
            case KEY_CODE.esc:
                this.close();
                break;
            default:
                break;
        }
    };

    getList = (isPagination = false) => {
        if (!this.props.requestService) return;

        const {depended} = this.props;
        const form = {
            page: this.state.pagination.page,
            'per-page': this.state.pagination.perPage
        };

        if (depended && depended.length) {
            let dependedIsEmpty = false;

            depended.forEach(filter => {
                if (filter.value) {
                    form[filter.name] = filter.value;
                } else if (filter.required) {
                    dependedIsEmpty = true;
                }
            });

            if (dependedIsEmpty) {
                return this.props.onChange(this.isMultiple ? [] : '');
            }
        }

        this.props.requestService(form).then(response => {
            const pagination = {
                pageCount: +_.get(response.headers, 'x-pagination-page-count'),
                page: +_.get(response.headers, 'x-pagination-current-page'),
                perPage: +_.get(response.headers, 'x-pagination-per-page'),
                totalCount: +_.get(response.headers, 'x-pagination-total-count')
            };
            const options = response.data.map(option => ({
                name: _.get(option, 'name'),
                value: _.get(option, 'id')
            }));

            if (!this.isMount) return;

            this.setState({
                options: isPagination ? _.uniqBy(this.state.options.concat(options), 'value') : options,
                pagination,
                inProgress: false
            }, () => {
                this.checkSelected();
                this.initScrollBar();
            });
        }).catch(() => this.setState({inProgress: false}));
    };

    getOptions = () => {
        return this.state.searchString && this.state.searchOptions.length ?
            this.state.searchOptions : this.state.options || this.props.options;
    };

    checkSelected = () => {
        const {selected} = this.props;
        let options = this.getOptions();

        if (!options.length) return;

        let result = selected;

        if (_.isString(result)) {
            result = options.find(({value}) => value === result);

            if (result) this.props.onChange(result);
        } else if (_.isObject(result)) {
            result = options.find(({value}) => value === result.value);
        }

        // Если выбранный элемент не найден в списке подсказок, запросим его с сервера
        if (!result && options.length && this.props.requestService && selected) {
            this.setState({inProgress: true}, () => {
                this.props.requestService(null, _.isString(selected) ? selected : _.get(selected, 'value'))
                    .then(response => {
                        const item = Array.isArray(response.data) ? response.data[0] : response.data;

                        options.push({
                            name: _.get(item, 'name'),
                            value: _.get(item, 'id')
                        });

                        options = _.uniqBy(options, 'value');

                        if (this.isMount) this.setState({options, inProgress: false}, this.initScrollBar);
                    });
            });
        }
    };

    submitNewItem = (event) => {
        const {target: {value}} = event;
        const {canAddNewValue, onChange} = this.props;
        const newState = this.state;
        const newOption = {};

        if (canAddNewValue && value) {
            newOption.name = value;
            newOption.value = value;
            newOption.isNew = true;
            newState.searchOptions = [];
            newState.options.push(newOption);
        }

        newState.searchFocused = false;

        this.setState(newState, () => {
            if (canAddNewValue && value) onChange(newOption);
        });
    };

    open = () => {
        this.setState({opened: true}, () => {
            if (_.isEmpty(this.props.selected) && this.searchRef) {
                this.searchRef.focus();
            }

            this.initScrollBar();
        });
    };

    close = () => {
        this.setState({
            opened: false,
            searchString: '',
            searchOptions: []
        }, this.initScrollBar);
    };

    toggle = () => {
        if  (this.state.opened) this.close();
        else this.open();
    };

    highlight = (text, searchString) => {
        if (searchString) {
            const parts = text.split(new RegExp(`(${searchString})`, 'gi'));

            return (
                <span>
                    {parts.map((part, i) =>
                        <span
                            key={i}
                            style={part.toLowerCase() === searchString.toLowerCase() ?
                                {backgroundColor: '#ffff8f'} : {}}
                        >
                            {part}
                        </span>
                    )}
                </span>);
        }

        return text;
    };

    validate = () => {
        const invalid = this.props.required && !this.props.selected ||
            (this.props.selected instanceof Array && !this.props.selected.length);

        this.setState({error: invalid, opened: false});
        return EventEmitter.emit(invalid ? EVENTS.FORM.ON_VALIDATE_FAILURE : EVENTS.FORM.ON_VALIDATE_SUCCESS);
    };

    initScrollBar = () => {
        if (!this.listRef) return;

        const scroll = InitScrollbar(this.listRef);

        if (scroll) this.scrollBar = scroll;
        else if (this.scrollBar) this.scrollBar.update();
    };

    depended = null;

    searchQuery = (value) => {
        if (this.props.requestCancelService) this.props.requestCancelService();

        this.setState({inProgress: true}, () => {
            this.props.requestService({'query[name]': value}).then(response => {
                if (!this.isMount) return;

                this.setState({
                    inProgress: false,
                    searchOptions: response.data.map(({id, name}) => ({name, value: id}))
                });
            });
        });
    };

    debouncedSearch = _.debounce(this.searchQuery, 1000);

    isMobileView = isMobileScreen();

    isMultiple = this.props.selected instanceof Array;

    isMount = true;

    render() {
        const {
            placeholder,
            label,
            disabled,
            required,
            withSearch,
            fixedPosList,
            validateErrorMessage,
            className,
            canAddNewValue,
            readOnly
        } = this.props;
        const {opened, searchString, searchFocused, inProgress, error} = this.state;
        const options = this.getOptions();
        const selected = _.isString(this.props.selected) &&
            options.find(({value}) => value === this.props.selected) || this.props.selected;
        const isMultiple = selected instanceof Array;
        const selectedName = isMultiple ?
            [...selected].slice(0, 3).map(({name}) => name).join(', ') :
            _.get(selected, 'name');

        return (
            <div
                {...cls('', {
                    error,
                    multiple: isMultiple,
                    mobile: this.isMobileView,
                    succeed: isMultiple && selected.length || !_.isEmpty(selected),
                    disabled: disabled || !options.length && !canAddNewValue,
                    readOnly
                }, {
                    validated: required,
                    [className]: !!className
                })}
            >
                {label && (
                    <label {...cls('label', '', 'drag-handle')}>
                        <span {...cls('label-text', '', 'drag-handle')}>{label}</span>
                    </label>
                )}

                <div ref={node => this.domNode = node}>
                    <div {...cls('container', {opened})} onClick={() => this.toggle()}>
                        {(placeholder && !selectedName && !searchString.length) && (
                            <span {...cls('placeholder')}>{searchFocused ? 'Начните вводить...' :
                                options.length ? placeholder : 'Нет элементов для выбора'}</span>
                        )}

                        {selectedName && (
                            <div {...cls('selected-value')}>
                                <div {...cls('selected-name')}>
                                    <span>{selectedName}</span> {(isMultiple && selected.length > 3) &&
                                    <i>+{selected.length - 3}</i>}
                                </div>
                                {selected.description && (
                                    <div {...cls('selected-description')}>{selected.description}</div>
                                )}
                            </div>
                        )}

                        {!!searchString.length || selectedName  && (
                            <button
                                type='button'
                                {...cls('search-clear-button')}
                                onClick={this.handleClearValue}
                            >✕</button>
                        )}

                        {(!opened && inProgress) && (
                            <Loader
                                {...cls('small-loader')}
                                radius={8}
                                strokeWidth={3}
                            />
                        )}
                    </div>

                    {opened && (
                        <div
                            {...cls('list-container', {fixed: fixedPosList})}
                            style={fixedPosList ? {width: this.domNode.offsetWidth} : null}
                        >
                            {this.isMobileView && (
                                <div {...cls('list-header')}>
                                    <h3 {...cls('list-title')}>{label}</h3>
                                    <a
                                        rel='button'
                                        {...cls('list-close-button')}
                                        onClick={() => this.close()}
                                    >✕</a>
                                </div>
                            )}

                            {withSearch && (
                                <div {...cls('search-wrapper')}>
                                    <input
                                        {...cls('search-field')}
                                        type='text'
                                        autoFocus
                                        placeholder='Поиск...'
                                        onChange={this.handleSearch}
                                        onFocus={this.handleSearchFocus}
                                        onBlur={this.handleSearchBlur}
                                        onKeyDown={this.handleSearchKeyDown}
                                        value={searchString}
                                        readOnly={readOnly}
                                        ref={ref => this.searchRef = ref}
                                    />
                                </div>
                            )}

                            <ul
                                {...cls('list')}
                                ref={ref => this.listRef = ref}
                                onKeyDown={this.handleListKeyDown}
                                onScroll={this.handleListScroll}
                            >
                                {options.map((item, itemIndex) => {
                                    const active = isMultiple ?
                                        selected && selected.find(({value}) => value === item.value) :
                                        _.get(selected, 'value') === item.value;

                                    return (
                                        <li
                                            tabIndex={0}
                                            key={itemIndex}
                                            {...cls('list-item', {active})}
                                            onClick={() => this.handleSelect(item)}
                                            data-index={itemIndex}
                                        >
                                            {isMultiple ? (
                                                <CheckBox
                                                    label={this.state.searchOptions ?
                                                        this.highlight(item.name, searchString) : item.name}
                                                    onChange={() => null}
                                                    checked={active}
                                                >
                                                    <span {...cls('list-item-description')}>{item.description}</span>
                                                </CheckBox>
                                            ) : (
                                                <div>
                                                    <span {...cls('list-item-name')}>
                                                        {this.state.searchOptions ?
                                                            this.highlight(item.name, searchString) :
                                                            item.name
                                                        }
                                                    </span>
                                                    {item.description && (
                                                        <span
                                                            {...cls('list-item-description')}
                                                            title={item.description}
                                                        >{item.description}</span>
                                                    )}
                                                </div>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>

                            {inProgress &&  <Loader radius={8} strokeWidth={3}/>}
                        </div>
                    )}
                </div>

                {error && (
                    <span {...cls('message')}>{validateErrorMessage}</span>
                )}

                {(this.isMobileView && opened) && (
                    <div {...cls('overlay')} onClick={() => this.close()}/>
                )}
            </div>
        );
    }
}
