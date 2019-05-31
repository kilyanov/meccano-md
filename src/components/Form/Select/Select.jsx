import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './select.scss';
import {isMobileScreen} from '../../../helpers/Tools';
import CheckBox from '../CheckBox/CheckBox';
import {KEY_CODE} from '../../../constants';
import Loader from '../../Shared/Loader/Loader';

const classes = new Bem('select');

export default class Select extends Component {
    static propTypes = {
        selected: PropTypes.oneOfType([
            PropTypes.object,
            PropTypes.array
        ]),
        options: PropTypes.array,
        placeholder: PropTypes.string,
        onChange: PropTypes.func,
        onSearch: PropTypes.func,
        onCancelSearch: PropTypes.func,
        label: PropTypes.string.isRequired,
        withSearch: PropTypes.bool,
        requestService: PropTypes.func,
        requestCancelService: PropTypes.func
    };

    static defaultProps = {
        placeholder: 'Выберите из списка...',
        options: []
    };

    state = {
        opened: false,
        searchOptions: null,
        searchString: '',
        inProgress: false
    };

    componentDidMount() {
        if (this.props.requestService) {
            this.getInitialData();
        }

        document.addEventListener('click', this.handleClickOutside, true);
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.handleClickOutside, true);
    }

    handleClickOutside = (event) => {
        const isInnerClick = this.domNode && this.domNode.contains(event.target);

        if (!isInnerClick && this.state.opened) {
            this.close();
        }
    };

    handleSelect = (item) => {
        let selected = _.clone(this.props.selected);

        if (this.isMultiple) {
            if (selected.find(({value}) => value === item.value)) {
                selected = selected.filter(({value}) => value !== item.value);
            } else {
                selected.push(item);
            }
        } else this.close();

        this.setState({searchString: ''});

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

    handleSearchBlur = () => {
        this.setState({searchFocused: false});
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

    getInitialData = () => {
        if (this.props.requestService) {
            this.props.requestService().then(response => {
                const options = response.data.map(option => ({
                    name: _.get(option, 'name'),
                    value: _.get(option, 'id')
                }));

                this.setState({options});
            });
        }
    };

    open = () => {
        this.setState({opened: true}, () => {
            if (_.isEmpty(this.props.selected)) {
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

    debouncedSearch = _.debounce((value) => {
        if (this.props.requestCancelService) this.props.requestCancelService();

        this.props.requestService({'query[name]': value}).then(response => {
            this.setState({
                inProgress: false,
                searchOptions: response.data,
                opened: !!response.data.length
            });
        });
    }, 1000);

    isMobileView = isMobileScreen();

    isMultiple = this.props.selected instanceof Array;

    render() {
        const {placeholder, label, selected, withSearch} = this.props;
        const {opened, searchString, searchFocused, inProgress} = this.state;
        const isMultiple = selected instanceof Array;
        const selectedName = isMultiple ? _.get(selected, '[0].name', '') : selected.name;
        const options = this.state.searchOptions || this.state.options || this.props.options;

        return (
            <div {...classes('', {multiple: isMultiple, mobile: this.isMobileView})} ref={node => this.domNode = node}>
                <label {...classes('label')}>
                    <span {...classes('label-text')}>{label}</span>
                </label>

                <div {...classes('container', {opened})} onClick={() => this.toggle()}>
                    {(placeholder && !selectedName && !searchString.length) && (
                        <span {...classes('placeholder')}>{searchFocused ? 'Начните вводить...' : placeholder}</span>
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
                            <span>{selectedName}</span> {(isMultiple && selected.length > 1) && <i>+{selected.length - 1}</i>}
                        </span>
                    )}

                    {!!searchString.length || selectedName  && (
                        <button
                            type='button'
                            {...classes('search-clear-button')}
                            onClick={this.handleClearValue}
                        >✕</button>
                    )}
                </div>

                {(opened && !inProgress) && (
                    <div {...classes('list-container')}>
                        {this.isMobileView && (
                            <div {...classes('list-header')}>
                                <h3 {...classes('list-title')}>{label}</h3>
                                <a
                                    rel='button'
                                    {...classes('list-close-button')}
                                    onClick={() => this.setState({searchString: '', searchOptions: null})}
                                >✕</a>
                            </div>
                        )}

                        <ul
                            {...classes('list')}
                            ref={ref => this.listRef = ref}
                            onKeyDown={this.handleListKeyDown}
                        >
                            {options.map((item, itemIndex) => {
                                const active = isMultiple ?
                                    selected.find(({value}) => value === item.value) :
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
                    </div>
                )}

                {(opened && inProgress) && (
                    <div {...classes('list-container')}>
                        <ul {...classes('list', 'progress')}>
                            <Loader radius={8} strokeWidth={3}/>
                        </ul>
                    </div>
                )}

                {(this.isMobileView && opened) && (
                    <div {...classes('overlay')} onClick={() => this.close()}/>
                )}
            </div>
        );
    }
}
