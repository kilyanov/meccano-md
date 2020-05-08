import React from 'react';
import './settings-body.scss';

const cls = new Bem('settings-body');

export default function SettingsBody({children, title}) {
    return (
        <section {...cls()}>
            <h3 {...cls('title')}>{title}</h3>
            {children}
        </section>
    );
}
