import React from 'react';
import {Link} from 'react-router-dom';
import './back-button.scss';

const BackButton = ({to, className, force = false}) => {
    return (history.state && !force) ? (
        <button
            className={`back-button ${className}`}
            onClick={() => history.back()}
        ><i>‹</i> Назад к проекту</button>
    ) : <Link className={`back-button ${className}`} to={to}><i>‹</i> Назад к проекту</Link>;
};

export default BackButton;
