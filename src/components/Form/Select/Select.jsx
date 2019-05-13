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
        const isMultiple = selected instanceof Array;

        if (isMultiple) {
            if (selected.find(({value}) => value === item.value)) {
                selected = selected.filter(({value}) => value !== item.value);
            } else {
                selected.push(item);
            }
        } else this.close();

        return this.props.onChange(isMultiple ? selected : item);
    };

    handleSearch = (event) => {
        const value = event.target.value.trim().toLowerCase();

        console.log(value);

        this.setState({searchString: event.target.value});
    };

    open = () => {
        this.setState({opened: true});
    };

    close = () => {
        this.setState({opened: false});
    };

    toggle = () => {
        if  (this.state.opened) this.close();
        else this.open();
    };

    isMobileView = isMobileScreen();

    render() {
        const {options, placeholder, label, selected, withSearch} = this.props;
        const {opened, searchString} = this.state;
        const isMultiple = selected instanceof Array;
        const selectedName = isMultiple ? _.get(selected, '[0].name', '') : selected.name;
        const searchInFocus = document.activeElement === this.searchRef;

        return (
            <div {...classes('', {multiple: isMultiple, mobile: this.isMobileView})} ref={node => this.domNode = node}>
                <label {...classes('label')}>
                    <span {...classes('label-text')}>{label}</span>
                </label>

                <div {...classes('container', {opened})} onClick={() => this.toggle()}>
                    {(placeholder && !selectedName && !searchString.length) && (
                        <span {...classes('placeholder')}>{searchInFocus ? 'Начните вводить...' : placeholder}</span>
                    )}

                    {withSearch && (
                        <div {...classes('search-wrapper')}>
                            <input
                                {...classes('search-field')}
                                type='text'
                                onChange={this.handleSearch}
                                value={searchString}
                                ref={ref => this.searchRef = ref}
                            />

                            {!!searchString.length  && (
                                <button {...classes('search-clear-button')}>✕</button>
                            )}
                        </div>
                    )}

                    {(selectedName && !searchString.length) && (
                        <span {...classes('selected-name')}>
                            <span>{selectedName}</span> {(isMultiple && selected.length > 1) && <i>+{selected.length - 1}</i>}
                        </span>
                    )}
                </div>

                {opened && (
                    <div {...classes('list-container')}>
                        {this.isMobileView && (
                            <div {...classes('list-header')}>
                                <h3 {...classes('list-title')}>{label}</h3>
                                <button
                                    {...classes('list-close-button')}
                                    onClick={() => this.close()}
                                >✕</button>
                            </div>
                        )}

                        <ul {...classes('list')}>
                            {options.map((item, itemIndex) => {
                                const active = isMultiple ?
                                    selected.find(({value}) => value === item.value) :
                                    _.get(selected, 'value') === item.value;

                                return (
                                    <li
                                        key={itemIndex}
                                        {...classes('list-item', {active})}
                                        onClick={() => this.handleSelect(item)}
                                    >
                                        {isMultiple ? (
                                            <CheckBox
                                                label={item.name}
                                                onChange={() => null}
                                                checked={active}
                                            />
                                        ) : item.name}
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
