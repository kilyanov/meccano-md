import React, { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArticleService } from "../../../services";
import Loader from "../../Shared/Loader/Loader";
import BEMHelper from "react-bem-helper";
import './article-movement-history.scss';

const cls = new BEMHelper('article-movement-history');

export default function ArticleMovementHistory({ articleId, userType, children }) {
    const [ inProgress, setInProgress ] = useState(true);
    const [ error, setError ] = useState(null);
    const [ data, setData ] = useState(null);
    const [ isOpen, setIsOpen ] = useState(false);
    const [ coords, setCoords ] = useState(null);
    const cellRef = useRef(null);
    const handleMouseEnter = () => {
        if (!children || !articleId || !userType) return;

        setIsOpen(true);
        if (!data) getHistory();
    };
    const handleMouseLeave = () => {
        setIsOpen(false);
    };
    const getHistory = useCallback(() => {
        if (!articleId || !userType) return;

        ArticleService
            .get(articleId, {  user_type: userType.id, expand: 'usersManagers.user' })
            .then(response => {
                if (response && response.data && response.data.usersManagers) {
                    setData(response.data.usersManagers);
                }
            })
            .catch(() => setError('Произошла ошибка, обратитесь к администратору или технической поддержке.'))
            .finally(() => setInProgress(false));
    }, [ articleId, setData, userType ]);
    const popoverNode = createPortal(
        <div
            { ...cls('popover', { opened: isOpen }) }
            style={{ top: `${coords?.top + coords?.height}px`, left: `${coords?.left + coords?.width}px` }}
        >
            <p { ...cls('title') }>История передвижения</p>

            { inProgress && <Loader radius={ 10 } strokeWidth={ 3 } /> }
            { error && <p { ...cls('error') }>{ error }</p> }

            { data && (
                <ul { ...cls('list') }>
                    { data.map(({ createdAt, user }) => (
                        <li { ...cls('list-item') } key={ user.id }>
                            <div { ...cls('user') }>
                                <p { ...cls('user-name') }>от { user.surname } { user.name }</p>
                                <p { ...cls('user-email') }>{ user.email }</p>
                            </div>

                            <p { ...cls('date') }>{ moment(createdAt).format('DD.MM.YY [в] HH:mm') }</p>
                        </li>
                    )) }
                </ul>
            ) }
        </div>,
        document.body
    );

    useEffect(() => {
        if (isOpen && cellRef && cellRef.current) {
            const rect = cellRef.current.getBoundingClientRect();

            if (rect) setCoords(rect);
        }
    }, [ cellRef, isOpen ]);

    console.log(coords?.top, coords?.left);

    return (
        <div
            { ...cls() }
            ref={ cellRef }
            onMouseEnter={ handleMouseEnter }
            onMouseLeave={ handleMouseLeave }
        >
            { children }

            { popoverNode }
        </div>
    );
}
