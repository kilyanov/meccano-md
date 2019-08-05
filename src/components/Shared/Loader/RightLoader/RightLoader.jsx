import React from 'react';
import Loader from '../Loader';
import './right-loader.scss';

const classes = new Bem('right-loader');
const RightLoader = () => {
    return (
        <div {...classes()}>
            <Loader radius={10} strokeWidth={3}/>
        </div>
    );
};

export default RightLoader;
