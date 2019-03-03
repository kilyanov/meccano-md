import React from 'react';
import './style.scss';

const NotFoundPage = () => {
    const classes = new Bem('not-found-page');

    return (
        <div {...classes('', '', 'page')}>
            <h1>404</h1>
            <h3>Страница не найдена</h3>
        </div>
    );
};

export default NotFoundPage;
