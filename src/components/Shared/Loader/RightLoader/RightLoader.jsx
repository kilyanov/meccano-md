import React from 'react';
import Loader from '../Loader';
import './right-loader.scss';

const cls = new Bem('right-loader');
const RightLoader = () => {
    return (
        <div {...cls()}>
            <Loader radius={10} strokeWidth={3}/>
        </div>
    );
};

export default RightLoader;
