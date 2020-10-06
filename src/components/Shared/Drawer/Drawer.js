import React from 'react';
import PropTypes from 'prop-types';
import {KEY_CODE} from '../../../constants';
import './drawer.scss';

const cls = new Bem('drawer');

function Drawer({ children, title, isOpen, onClose, closeOnEsc, closeOnOverlay, closeOnButton }) {
    const [isClose, setIsClose] = React.useState(false);
    const drawerRef = React.useRef();

    const handleClose = () => {
        setIsClose(true);
    };

    const handleOverlayClose = (event) => {
        if (closeOnOverlay && event.target.classList.contains('drawer')) handleClose();
    };

    const handleDocumentKeyDown = (event) => {
        if (event.keyCode === KEY_CODE.esc) {
            handleClose();
        }
    };

    const handleAnimation = (event) => {
        if (event.animationName === 'drawer-hide') {
            drawerRef.current.removeEventListener('animationend', handleAnimation);
            document.removeEventListener('keydown', handleDocumentKeyDown);
            onClose();
            setIsClose(false);
        }
    };
    
    React.useEffect(() => {
        if (drawerRef.current) {
            drawerRef.current.addEventListener('animationend', handleAnimation);
        }
        if (closeOnEsc && isOpen) {
            document.addEventListener('keydown', handleDocumentKeyDown);
        }
    }, [isOpen]);

    return (
        <>
            {isOpen &&
                <div {...cls(null, {'closed': isClose})} onClick={handleOverlayClose} ref={drawerRef}>
                    <div {...cls('container', {'closed': isClose})}>
                        <div {...cls('header')}>
                            {title && 
                                <h3 {...cls('title')}>{title}</h3>
                            }
                            {closeOnButton && 
                                <button
                                    {...cls('button-close')}
                                    onClick={() => handleClose()}
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
