import React from 'react';
import PropTypes from 'prop-types';

function ReprintsIcon({ className }) {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 40 40"
        >
            <g fillRule="nonzero">
                <path d="M32 4H17.6L8 14.6V36h24V4zm-2 30H10V15.4L18.4 6H30v28z" />
                <path d="M17.4 15.2l-4.4 3v1.6l4.4 3 1.2-1.6-2.7-1.2H26v-2H15.9l2.7-1.2zM21.4 24.8l2.7 1.2H14v2h10.1l-2.7 1.2 1.2 1.6 4.4-3v-1.6l-4.4-3z" />
            </g>
        </svg>
    );
}

ReprintsIcon.propTypes = {
    className: PropTypes.string
};

export default ReprintsIcon;
