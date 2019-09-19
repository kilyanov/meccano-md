import React from 'react';
import './list-ended-stub.scss';

const cls = new Bem('list-ended-stub');
const ListEndedStub = ({className, text = 'Больше нет'}) => (
    <div {...cls('', '', className)}>
        <span {...cls('text')}>{text}</span>
    </div>
);

export default ListEndedStub;
