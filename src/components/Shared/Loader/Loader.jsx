import React from 'react';
import PropTypes from 'prop-types';
import './loader.scss';

const cls = new Bem('loader');
const Loader = ({
    className,
    fixed,
    rightBottom,
    radius = 20,
    strokeWidth = 5
}) => {
    const d = radius * 2 + 10;

    return (
        <div {...cls('', {fixed, rightBottom}, className)} >
            <svg
                width={d}
                height={d}
                viewBox={`0 0 ${d} ${d}`}
            >
                <circle
                    className='path'
                    cx={d / 2}
                    cy={d / 2}
                    r={radius}
                    fill='none'
                    strokeWidth={strokeWidth}
                />
            </svg>
        </div>
    );
};

Loader.propTypes = {
    className: PropTypes.string,
    fixed: PropTypes.bool,
    radius: PropTypes.number,
    strokeWidth: PropTypes.number
};

export default Loader;
