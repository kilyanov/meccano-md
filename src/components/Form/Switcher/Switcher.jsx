import React from 'react';
import './switcher.scss';

const cls = new Bem('switcher');
const Switcher = ({className, checked, onChange, children}) => (
    <div
        {...cls('', {checked}, className)}
        onClick={() => onChange(!checked)}
    >
        <div {...cls('switch')} />
        {children}
    </div>
);

export default Switcher;
