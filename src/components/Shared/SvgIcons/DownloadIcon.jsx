import React from 'react';

const DownloadIcon = ({className}) => (
    <svg 
        className={className}
        xmlns='http://www.w3.org/2000/svg' 
        width='40' 
        height='40' 
        viewBox='0 0 40 40'
    >
        <path 
            fillRule='nonzero' 
            d='M30 20h2v14H8V20h2v12h20V20zM19 6v14l-2.7-3.9-1.6 1.1 4.4 6.4h1.8l4.4-6.4-1.6-1.1L21 20V6h-2z'
        />
    </svg>
);

export default DownloadIcon;
