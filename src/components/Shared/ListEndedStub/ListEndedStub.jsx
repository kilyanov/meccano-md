import React from 'react';
import './list-ended-stub.scss';

const classes = new Bem('list-ended-stub');
const ListEndedStub = ({className, text = 'Больше нет'}) => (
    <div {...classes('', '', className)}>
        <span {...classes('text')}>{text}</span>
    </div>
);

export default ListEndedStub;
