import React, {useRef, useEffect} from 'react';
import Page from '../../Shared/Page/Page';
import SettingsMenu from './SettingsMenu/SettingsMenu';
import {InitScrollbar} from '../../../helpers/Tools';
import './settings-page.scss';
import Button from '../../Shared/Button/Button';
import Loader from '../../Shared/Loader/Loader';

const classes = new Bem('settings-page');

const SettingsPage = ({
    title,
    subtitle,
    children,
    withAddButton,
    inProgress,
    addButtonTitle = 'Добавить',
    onAdd = () => {},
    onEndPage = () => {}
}) => {
    const bodyRef = useRef(null);
    const handleScroll = event => {
        const {target} = event;
        const isEndPage = target.scrollTop === target.scrollHeight - target.clientHeight;

        if (isEndPage) onEndPage();
    };

    useEffect(() => {
        if (bodyRef) InitScrollbar(bodyRef.current);
    });

    return (
        <Page withBar {...classes()}>
            <h2 {...classes('title')}>Настройки</h2>

            <section {...classes('content')}>
                <aside {...classes('left-sidebar')}>
                    <SettingsMenu/>
                </aside>

                <div
                    {...classes('body', {empty: !children})}
                    ref={bodyRef}
                    onScroll={handleScroll}
                >
                    {!!children && (
                        <div {...classes('body-header')}>
                            <div {...classes('body-title-wrapper')}>
                                <h2 {...classes('body-title')}>{title}</h2>

                                {subtitle && <h5 {...classes('body-subtitle')}>{subtitle}</h5>}
                            </div>

                            {withAddButton && (
                                <Button
                                    {...classes('button', 'add')}
                                    text={addButtonTitle}
                                    onClick={onAdd}
                                />
                            )}
                        </div>
                    )}

                    {children}

                    {!children && (
                        <div {...classes('stub')}>
                            <h2>Настройки</h2>
                            <h5>Выберите пункт меню слева</h5>
                        </div>
                    )}
                </div>

                {inProgress && <Loader {...classes('loader')}/>}
            </section>
        </Page>
    );
};

export default SettingsPage;
