import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './select.scss';
import {isMobileScreen} from '../../../helpers/Tools';
import CheckBox from '../CheckBox/CheckBox';
import {KEY_CODE} from '../../../constants';
import Loader from '../../Shared/Loader/Loader';
import {EventEmitter} from '../../../helpers';
import {EVENTS} from '../../../constants/Events';

const classes = new Bem('select');
const NEW_VALUE = 'new';

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
        label: PropTypes.string.isRequired,
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
        searchOptions: null,
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
    }

    componentDidUpdate(prevProps) {
        const options = this.state.searchOptions || this.state.options || this.props.options;

        if (!this.props.depended) return;

        if (!_.isEqual(this.props.depended, prevProps.depended)) {
            this.setState({
                inProgress: true,
                options: null
            }, () => {
                this.props.onChange(this.isMultiple ? [] : '');
                this.getList();
            });
        }

        if (this.props.selected !== prevProps.selected && options.length) {
            this.checkSelected();
        }
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
                searchString: event.target.value,
                inProgress: true
            }, () => {
                if (value) this.debouncedSearch(value);
                else this.setState({inProgress: false, searchOptions: null});
            });
        } else {
            const searchOptions = this.props.options.filter(({name}) => name.toLowerCase().includes(value));

            this.setState({
                searchString: event.target.value,
                searchOptions: !!value && searchOptions
            });
        }
    };

    handleSearchFocus = () => {
        this.setState({searchFocused: true});
    };

    handleSearchBlur = (event) => {
        const {target: {value}} = event;
        const {canAddNewValue, onChange} = this.props;
        const newState = this.state;
        const newOption = {};

        if (canAddNewValue && value) {
            newOption.name = value;
            newOption.value = value;
            newOption.isNew = true;
            newState.searchOptions = null;
            newState.options.push(newOption);
        }

        newState.searchFocused = false;
        newState.searchString = '';

        this.setState(newState, () => {
            if (canAddNewValue && value) onChange(newOption);
        });
    };

    handleSearchKeyDown = (event) => {
        if (!this.listRef) return;

        switch (event.keyCode) {
            case KEY_CODE.arrows.down:
                this.listRef.querySelector('li:first-child').focus();
                event.preventDefault();
                break;
            case KEY_CODE.arrows.up:
                this.listRef.querySelector('li:last-child').focus();
                event.preventDefault();
                break;
            default:
                break;
        }
    };

    handleClearValue = () => {
        const {canAddNewValue} = this.props;
        const newState = this.state;
        const options = this.state.searchOptions || this.state.options || this.props.options;
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
        const options = this.state.searchOptions || this.props.options;

        event.preventDefault();

        switch (event.keyCode) {
            case KEY_CODE.arrows.down:
                if (focused && focused.nextElementSibling) {
                    focused.nextElementSibling.focus();
                } else {
                    this.listRef.querySelector('li:first-child').focus();
                }
                break;
            case KEY_CODE.arrows.up:
                if (focused && focused.previousElementSibling) {
                    focused.previousElementSibling.focus();
                } else {
                    this.listRef.querySelector('li:last-child').focus();
                }
                break;
            case KEY_CODE.enter:
                this.handleSelect(options[focused.getAttribute('data-index')]);
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
            }, this.checkSelected);
        }).catch(() => this.setState({inProgress: false}));
    };

    checkSelected = () => {
        const {selected} = this.props;
        let options = this.state.searchOptions || this.state.options || this.props.options;

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
            this.props.requestService(null, _.isString(selected) ? selected : _.get(selected, 'value'))
                .then(response => {
                    const item = Array.isArray(response.data) ? response.data[0] : response.data;

                    options.push({
                        name: _.get(item, 'name'),
                        value: _.get(item, 'id')
                    });

                    options = _.uniqBy(options, 'value');

                    if (this.isMount) this.setState({options});
                });
        }
    };

    open = () => {
        this.setState({opened: true}, () => {
            if (_.isEmpty(this.props.selected) && this.searchRef) {
                this.searchRef.focus();
            }
        });
    };

    close = () => {
        this.setState({
            opened: false,
            searchString: '',
            searchOptions: null
        });
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
        const invalid = this.props.required && !this.props.selected;

        this.setState({error: invalid, opened: false});
        return EventEmitter.emit(invalid ? EVENTS.FORM.ON_VALIDATE_FAILURE : EVENTS.FORM.ON_VALIDATE_SUCCESS);
    };

    depended = null;

    debouncedSearch = _.debounce((value) => {
        if (this.props.requestCancelService) this.props.requestCancelService();

        this.props.requestService({'query[name]': value}).then(response => {
            if (!this.isMount) return;

            this.setState({
                inProgress: false,
                searchOptions: response.data.length ? response.data : null,
                opened: !!response.data.length
            });
        });
    }, 1000);

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
            canAddNewValue
        } = this.props;
        const {opened, searchString, searchFocused, inProgress, error} = this.state;
        const options = this.state.searchOptions || this.state.options || this.props.options;
        const selected = _.isString(this.props.selected) &&
            options.find(({value}) => value === this.props.selected) || this.props.selected;
        const isMultiple = selected instanceof Array;
        const selectedName = isMultiple ? _.get(selected, '[0].name', '') : _.get(selected, 'name');

        return (
            <div
                {...classes('', {
                    error,
                    multiple: isMultiple,
                    mobile: this.isMobileView,
                    succeed: isMultiple && selected.length || !_.isEmpty(selected),
                    disabled: disabled || !options.length && !canAddNewValue
                }, {
                    validated: required,
                    [className]: !!className
                })}
            >
                <label {...classes('label', '', 'drag-handle')}>
                    <span {...classes('label-text', '', 'drag-handle')}>{label}</span>
                </label>

                <div ref={node => this.domNode = node}>
                    <div {...classes('container', {opened})} onClick={() => this.toggle()}>
                        {(placeholder && !selectedName && !searchString.length) && (
                            <span {...classes('placeholder')}>{searchFocused ? 'Начните вводить...' :
                                options.length ? placeholder : 'Нет элементов для выбора'}</span>
                        )}

                        {withSearch && (
                            <div {...classes('search-wrapper')}>
                                <input
                                    {...classes('search-field')}
                                    type='text'
                                    onChange={this.handleSearch}
                                    onFocus={this.handleSearchFocus}
                                    onBlur={this.handleSearchBlur}
                                    onKeyDown={this.handleSearchKeyDown}
                                    value={searchString}
                                    ref={ref => this.searchRef = ref}
                                />
                            </div>
                        )}

                        {(selectedName && !searchString.length) && (
                            <span {...classes('selected-name')}>
                                <span>{selectedName}</span> {(isMultiple && selected.length > 1) &&
                                <i>+{selected.length - 1}</i>}
                            </span>
                        )}

                        {!!searchString.length || selectedName  && (
                            <button
                                type='button'
                                {...classes('search-clear-button')}
                                onClick={this.handleClearValue}
                            >✕</button>
                        )}

                        {(!opened && inProgress) && (
                            <Loader
                                {...classes('small-loader')}
                                radius={8}
                                strokeWidth={3}
                            />
                        )}
                    </div>

                    {opened && (
                        <div
                            {...classes('list-container', {fixed: fixedPosList})}
                            style={fixedPosList ? {width: this.domNode.offsetWidth} : null}
                        >
                            {this.isMobileView && (
                                <div {...classes('list-header')}>
                                    <h3 {...classes('list-title')}>{label}</h3>
                                    <a
                                        rel='button'
                                        {...classes('list-close-button')}
                                        onClick={() => this.close()}
                                    >✕</a>
                                </div>
                            )}

                            <ul
                                {...classes('list')}
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
                                            {...classes('list-item', {active})}
                                            onClick={() => this.handleSelect(item)}
                                            data-index={itemIndex}
                                        >
                                            {isMultiple ? (
                                                <CheckBox
                                                    label={this.state.searchOptions ?
                                                        this.highlight(item.name, searchString) : item.name}
                                                    onChange={() => null}
                                                    checked={active}
                                                />
                                            ) : this.state.searchOptions ? this.highlight(item.name, searchString) : item.name}
                                        </li>
                                    );
                                })}
                            </ul>

                            {inProgress &&  <Loader radius={8} strokeWidth={3}/>}
                        </div>
                    )}
                </div>

                {error && (
                    <span {...classes('message')}>{validateErrorMessage}</span>
                )}

                {(this.isMobileView && opened) && (
                    <div {...classes('overlay')} onClick={() => this.close()}/>
                )}
            </div>
        );
    }
}
