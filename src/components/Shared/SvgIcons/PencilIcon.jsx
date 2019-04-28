import React from 'react';

const PencilIcon = ({className, size = {width: 40, height: 40}}) => (
    <svg
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        width={size.width}
        height={size.height}
        viewBox="0 0 40 40"
    >
        <path
            fillRule="nonzero"
            /* eslint-disable */
            d="M36 10.8c0-1.3-.5-2.6-1.5-3.5l-1.8-1.8c-1-1-2.2-1.5-3.5-1.5-1.3 0-2.6.5-3.5 1.5L7.3 23.8 4 34l2 2 10.2-3.3 18.3-18.3c1-1 1.5-2.2 1.5-3.6zM15.2 30.9l-8.7 2.8-.1-.1 2.8-8.7L24.9 9l6.1 6.1-15.8 15.8zM33.1 13l-.7.7-6.1-6.1.7-.7c1.1-1.1 3.1-1.1 4.2 0L33 8.7c.7.6 1 1.3 1 2.1s-.3 1.6-.9 2.2z"
            /* eslint-enable */
        />
    </svg>
);

export default PencilIcon;
