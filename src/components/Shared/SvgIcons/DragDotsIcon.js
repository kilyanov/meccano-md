import React from 'react';

const DragDotsIcon = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="8"
        height="13"
        viewBox="0 0 8 13"
        fill="none"
        {...props}
    >
        <g fill="#333333">
            <circle
                cx="1.5"
                cy="1.5"
                r="1.5"
            />
            <path
                /* eslint-disable-next-line */
                d="M8 1.5C8 2.32843 7.32843 3 6.5 3C5.67157 3 5 2.32843 5 1.5C5 0.671573 5.67157 0 6.5 0C7.32843 0 8 0.671573 8 1.5Z"
            />
            <circle
                cx="1.5"
                cy="11.5"
                r="1.5"
            />
            <circle
                cx="6.5"
                cy="11.5"
                r="1.5"
            />
            <circle
                cx="1.5"
                cy="6.5"
                r="1.5"
            />
            <circle
                cx="6.5"
                cy="6.5"
                r="1.5"
            />
        </g>
    </svg>
);

export default DragDotsIcon;
