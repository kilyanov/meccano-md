import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import './tooltip.scss';

const cls = new Bem('tooltip');

function Tooltip(props) {
    const {
        target,
        content,
        position
    } = props;

    const [isShow, setIsShow] = useState(false);
    const wrapperRef = useRef(null);
    const targetRef = useRef(null);
    const contentRef = useRef(null);

    useEffect(() => {
        let isOver = false;
        const handleMouseOver = () => isOver = true;
        const handleMouseOut = () => isOver = false;

        const handleMouseMove = () => {
            if (isOver) {
                setIsShow(true);
            } else {
                setTimeout(() => setIsShow(false), 500);
            }
        };

        const handleMouseMoveWithDebounce = _.debounce(handleMouseMove, 200);

        wrapperRef.current.addEventListener('mousemove', handleMouseMoveWithDebounce);
        wrapperRef.current.addEventListener('mouseover', handleMouseOver);
        wrapperRef.current.addEventListener('mouseout', handleMouseOut);

        return () => {
            wrapperRef.current.removeEventListener('mousemove', handleMouseMoveWithDebounce);
            wrapperRef.current.removeEventListener('mouseover', handleMouseOver);
            wrapperRef.current.removeEventListener('mouseout', handleMouseOut);
        };
    }, []);

    const getModifiers = () => {
        const modifiers = [];
        if (position) modifiers.push(`position-${position}`);
        if (!modifiers.length) return null;
        return modifiers;
    };

    return (
        <div {...cls()} ref={wrapperRef}>
            <div {...cls('target')} ref={targetRef}>
                {target}
            </div>
            <div {...cls('origin', getModifiers())} ref={contentRef}>
                <div {...cls('content', { 'is-show': isShow })}>{content}</div>
            </div>
        </div>
    );
}

Tooltip.propTypes = {
    target: PropTypes.node,
    content: PropTypes.node,
    position: PropTypes.string
};

export default Tooltip;
