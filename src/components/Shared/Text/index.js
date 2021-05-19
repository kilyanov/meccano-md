import React from 'react';
import BEMHelper from 'react-bem-helper';
import PropTypes from 'prop-types';
import './Text.scss';

const cls = new BEMHelper('text');

export default function Text({
    size = 'm',
    color,
    weight = 'regular',
    fullWidth,
    children
}) {
    const Wrapper = fullWidth ? 'div' : 'span';

    return (
        <Wrapper
            { ...cls('', {
                [`color_${color}`]: !!color,
                [`size_${size}`]: !!size,
                [`weight_${weight}`]: !!weight
            }) }
        >
            {children}
        </Wrapper>
    );
}

Text.propTypes = {
    size: PropTypes.oneOf(['xs', 's', 'm', 'l', 'xl', 'xxl', 'xxxl']),
    color: PropTypes.oneOf(['red', 'green', 'blue']),
    weight: PropTypes.oneOf(['thin', 'light', 'regular', 'medium', 'bold']),
    fullWidth: PropTypes.bool,
    children: PropTypes.node
};
