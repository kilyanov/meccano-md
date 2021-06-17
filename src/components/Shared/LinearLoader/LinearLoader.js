import React from 'react';
import BEMHelper from 'react-bem-helper';
import './linear-loader.scss';

const cls = new BEMHelper('linear-loader');

export default function LinearLoader({ className }) {
    return (
        <div { ...cls('', '', className) }>
            <div { ...cls('indeterminate') } />
        </div>
    );
}
