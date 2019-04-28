import React from 'react';
import CheckIcon from '../SvgIcons/CheckIcon';
import './active-mark.scss';

const classes = new Bem('active-mark');
const ActiveMark = ({className}) => (
    <div {...classes('', '', className)}>
        <CheckIcon {...classes('icon')}/>
    </div>
);

export default ActiveMark;
