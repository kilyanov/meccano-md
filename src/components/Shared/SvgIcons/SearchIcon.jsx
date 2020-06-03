import React from 'react';

const SearchIcon = ({className, width = 32, height = 32}) => (
    <svg
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        viewBox={`0 0 32 32`}
    >
        <path
            fillRule="nonzero"
            /* eslint-disable */
            d="M16 24a9.94 9.94 0 0 0 5.7-1.8l4.83 5.8L28 26.72l-4.78-5.82A10 10 0 1 0 16 24zm0-18a8 8 0 1 1 0 16 8 8 0 0 1 0-16z"
            /* eslint-enable */
        />
    </svg>
);

export default SearchIcon;
