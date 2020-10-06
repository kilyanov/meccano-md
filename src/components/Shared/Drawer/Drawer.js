import React from 'react';
import PropTypes from 'prop-types';
import {KEY_CODE} from '../../../constants';
import './drawer.scss';

const cls = new Bem('drawer');

function Drawer({ children, title, isOpen, onClose, closeOnEsc, closeOnOverlay, closeOnButton }) {
    const closeDelay = 200;
    const [isClose, setIsClose] = React.useState(false);

    const closeByTimer = () => {
        setIsClose(true);
        setTimeout(() => {
            onClose();
            setIsClose(false);
        }, closeDelay);
    };

    const handleOverlayClose = (event) => {
        if (closeOnOverlay && event.target.classList.contains('drawer')) closeByTimer();
    };

    const handleDocumentKeyDown = (event) => {
        if (event.keyCode === KEY_CODE.esc) {
            closeByTimer();
        }
    };
    
    React.useEffect(() => {
        if (closeOnEsc && isOpen) {
            document.addEventListener('keydown', handleDocumentKeyDown);
        }
        return () => document.removeEventListener('keydown', handleDocumentKeyDown);
    }, [isOpen]);

    return (
        <>
            {isOpen &&
                <div {...cls(null, {'closed': isClose})} onClick={handleOverlayClose}>
                    <div {...cls('container', {'closed': isClose})}>
                        <div {...cls('header')}>
                            {title && 
                                <h3 {...cls('title')}>{title}</h3>
                            }
                            {closeOnButton && 
                                <button
                                    {...cls('button-close')}
                                    onClick={() => closeByTimer()}
                                    type="button"
                                    title="Закрыть окно"
                                >✕</button>
                            }
                        </div>
                        <div {...cls('body')}>{children}</div>
                    </div>
                </div>
            }
        </>
    );
}

Drawer.propTypes = {
    children: PropTypes.node,
    title: PropTypes.string,
    isOpen: PropTypes.bool,
    closeOnEsc: PropTypes.bool,
    onClose: PropTypes.func
};

export default Drawer;
