import React from 'react';
import './not-found-page.scss';
import Button from '../../Shared/Button/Button';

const NotFoundPage = () => {
    const classes = new Bem('not-found-page');

    return (
        <div {...classes('', '', 'page')}>
            <h1>404</h1>
            <h3>Страница не найдена</h3>

            <Button
                text='На главную'
                to='/'
                style='success'
            />
        </div>
    );
};

export default NotFoundPage;
