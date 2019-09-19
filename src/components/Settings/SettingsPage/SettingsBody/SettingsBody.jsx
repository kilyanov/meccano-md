import React, {useRef, useEffect} from 'react';
import './settings-body.scss';
import {InitScrollbar} from '../../../../helpers/Tools';

const cls = new Bem('settings-body');

const SettingsBody = ({children, title}) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (containerRef) {
            InitScrollbar(containerRef.current);
        }
    });

    return (
        <section ref={containerRef} {...cls()}>
            <h3 {...cls('title')}>{title}</h3>
            {children}
        </section>
    );
};

export default SettingsBody;
