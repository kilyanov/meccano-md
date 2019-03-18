import React from 'react';
import PropTypes from 'prop-types';
import SearchIcon from '../SvgIcons/SearchIcon';
import './search-filter.scss';

const classes = new Bem('search-filter');
const SearchFilter = ({
    className,
    value,
    onChange,
    placeholder
}) => (
    <div {...classes('', '', className)}>
        <label {...classes('label')}>
            <SearchIcon {...classes('icon')}/>
            <input
                {...classes('field')}
                type='text'
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
            />
        </label>
    </div>
);

SearchFilter.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    className: PropTypes.string
};

export default SearchFilter;
