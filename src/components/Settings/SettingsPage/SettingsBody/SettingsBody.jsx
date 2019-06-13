import React, {useRef, useEffect} from 'react';
import './settings-body.scss';
import {InitScrollbar} from '../../../../helpers/Tools';

const classes = new Bem('settings-body');

const SettingsBody = ({children, title}) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (containerRef) {
            InitScrollbar(containerRef.current);
        }
    });

    return (
        <section ref={containerRef} {...classes()}>
            <h3 {...classes('title')}>{title}</h3>
            {children}
        </section>
    );
};

export default SettingsBody;
