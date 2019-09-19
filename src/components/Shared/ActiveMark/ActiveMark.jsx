import React from 'react';
import CheckIcon from '../SvgIcons/CheckIcon';
import './active-mark.scss';

const cls = new Bem('active-mark');
const ActiveMark = ({className}) => (
    <div {...cls('', '', className)}>
        <CheckIcon {...cls('icon')}/>
    </div>
);

export default ActiveMark;
