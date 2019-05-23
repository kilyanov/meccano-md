import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './select.scss';
import {isMobileScreen} from '../../../helpers/Tools';
import CheckBox from '../CheckBox/CheckBox';

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
        label: PropTypes.string.isRequired,
        withSearch: PropTypes.bool
    };

    static defaultProps = {
        options: []
    };

    state = {
        opened: false,
        searchOptions: null,
        searchString: ''
    };

    componentDidMount() {
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
        const searchOptions = this.props.options.filter(({name}) => name.toLowerCase().includes(value));

        this.setState({searchString: event.target.value, searchOptions: !!value && searchOptions});
    };

    handleSearchFocus = () => {
        this.setState({searchFocused: true});
    };

    handleSearchBlur = () => {
        this.setState({searchFocused: false});
    };

    handleClearValue = () => {
        this.setState({searchString: ''});
        this.props.onChange(this.isMultiple ? [] : {});
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

    isMobileView = isMobileScreen();

    isMultiple = this.props.selected instanceof Array;

    render() {
        const {placeholder, label, selected, withSearch} = this.props;
        const {opened, searchString, searchFocused} = this.state;
        const isMultiple = selected instanceof Array;
        const selectedName = isMultiple ? _.get(selected, '[0].name', '') : selected.name;
        const options = this.state.searchOptions || this.props.options;

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

                {opened && (
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

                        <ul {...classes('list')}>
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
                                    >
                                        {isMultiple ? (
                                            <CheckBox
                                                label={this.highlight(item.name, searchString)}
                                                onChange={() => null}
                                                checked={active}
                                            />
                                        ) : this.highlight(item.name, searchString)}
                                    </li>
                                );
                            })}
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
