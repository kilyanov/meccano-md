import React from 'react';
import './not-found-page.scss';
import Button from '../../Shared/Button/Button';

const NotFoundPage = () => {
    const cls = new Bem('not-found-page');

    return (
        <div {...cls('', '', 'page')}>
            <h1 data-content='404'>404</h1>
            <h3 data-content='Страница не найдена'>Страница не найдена</h3>

            <Button
                text='На главную'
                to='/'
                style='success'
            />
        </div>
    );
};

export default NotFoundPage;
