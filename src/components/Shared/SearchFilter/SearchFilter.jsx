import React, {Component} from 'react';
import PropTypes from 'prop-types';
import SearchIcon from '../SvgIcons/SearchIcon';
import './search-filter.scss';
import {KEY_CODE} from '../../../constants';

const cls = new Bem('search-filter');

export default class SearchFilter extends Component {
    static propTypes = {
        value: PropTypes.string.isRequired,
        onChange: PropTypes.func.isRequired,
        onSearch: PropTypes.func.isRequired,
        placeholder: PropTypes.string,
        className: PropTypes.string
    };

    handleKeyDown = (event) => {
        switch (event.keyCode) {
            case KEY_CODE.enter:
                this.props.onSearch(this.props.value);
                break;
            case KEY_CODE.esc:
                this.inputRef.blur();
                break;
            default:
                break;
        }
    };

    render() {
        const {
            className,
            value,
            onChange,
            placeholder
        } = this.props;

        return (
            <div {...cls('', '', className)}>
                <label {...cls('label')}>
                    <SearchIcon {...cls('icon')}/>
                    <input
                        ref={ref => this.inputRef = ref}
                        {...cls('field')}
                        type='text'
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        onKeyDown={this.handleKeyDown}
                        placeholder={placeholder}
                    />
                </label>
            </div>
        );
    }
}
