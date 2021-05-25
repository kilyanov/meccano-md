import React from 'react';

export default function PlusIcon(props) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            {...props}
        >
            <rect
                x="15"
                y="3"
                width="2"
                height="26"
                fill="#C4C4C4"
            />
            <rect
                x="29"
                y="15"
                width="2"
                height="26"
                transform="rotate(90 29 15)"
                fill="#C4C4C4"
            />
        </svg>
    )
}
