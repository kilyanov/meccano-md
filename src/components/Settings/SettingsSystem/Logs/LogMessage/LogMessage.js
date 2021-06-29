import React from 'react';
import BEMHelper from 'react-bem-helper';
import moment from 'moment';

import './log-message.scss';

const cls = new BEMHelper('log-message');

const levels = {
    1: 'error',
    2: 'warning',
    4: 'info',
    8: 'debug',
    40: 'profile'
};
const levelsRus = {
    1: 'Ошибка',
    2: 'Предупреждение',
    4: 'Информация',
    8: 'Debug',
    40: 'Профиль'
};

const LogMessage = ({
    category,
    level,
    log_time,
    message,
    prefix,
}) => (
    <div { ...cls('', { [levels[level]]: 1 }) }>
        <section { ...cls('heading') }>
            <div { ...cls('level') } title='Уровень'>{levelsRus[level]}</div>
            <div { ...cls('category') } title='Категория'>{category}</div>
        </section>
        <p { ...cls('message') }>{message}</p>
        <section { ...cls('footer') }>
            <div { ...cls('prefix') } title='Префикс'>{prefix}</div>
            <div { ...cls('time') } title='Время'>{moment(log_time).format('DD.MM.YYYY HH:mm')}</div>
        </section>
    </div>
);

export default LogMessage;
