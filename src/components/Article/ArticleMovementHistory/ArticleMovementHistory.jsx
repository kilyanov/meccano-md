import React, { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArticleService } from "@services";
import Loader from "../../Shared/Loader/Loader";
import BEMHelper from "react-bem-helper";
import './article-movement-history.scss';

const cls = new BEMHelper('article-movement-history');

export default function ArticleMovementHistory({ articleId, userType, usersManagers, children }) {
    const [ inProgress, setInProgress ] = useState(!usersManagers);
    const [ error, setError ] = useState(null);
    const [ data, setData ] = useState(usersManagers || null);
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
                    { data.map(({ user }, index) => {
                        const nextOwner = data[index + 1]?.user;
                        const userDataString = (ud) => `${ud.surname} ${ud.name} ${ud.department ? `(${ud.department})` : ''}`;

                        return index < data.length - 1 ? (
                            <li { ...cls('list-item') } key={ user.id }>
                                <div { ...cls('user') }>
                                    <p { ...cls('user-name') }>
                                        от: { userDataString(user) }
                                    </p>
                                    <p { ...cls('user-email') }>{ user.email }</p>

                                    {nextOwner && (
                                        <>
                                            <p { ...cls('user-name') }>кому: { userDataString(nextOwner) }</p>
                                            <p { ...cls('user-email') }>{ nextOwner.email }</p>
                                        </>
                                    )}
                                </div>

                                <p { ...cls('date') }>
                                    { moment(data[index + 1]?.createdAt).format('DD.MM.YY [в] HH:mm') }
                                </p>
                            </li>
                        ) : null;
                    }) }
                </ul>
            ) }

            { data?.length < 2 && <span { ...cls('empty-msg') }>Нет истории передвижений статьи</span> }
        </div>,
        document.body
    );

    useEffect(() => {
        if (isOpen && cellRef && cellRef.current) {
            const rect = cellRef.current.getBoundingClientRect();

            if (rect) setCoords(rect);
        }
    }, [ cellRef, isOpen ]);

    return (
        <div
            { ...cls() }
            ref={ cellRef }
            onMouseEnter={ handleMouseEnter }
            onMouseLeave={ handleMouseLeave }
            onClick={e => e.preventDefault()}
        >
            { children }

            { popoverNode }
        </div>
    );
}
