import React, {useRef, useEffect} from 'react';
import Page from '../../Shared/Page/Page';
import SettingsMenu from './SettingsMenu/SettingsMenu';
import {InitScrollbar} from '../../../helpers/Tools';
import './settings-page.scss';
import Button from '../../Shared/Button/Button';

const classes = new Bem('settings-page');

const SettingsPage = ({
    title,
    subtitle,
    children,
    withAddButton,
    addButtonTitle = 'Добавить',
    onAdd = () => {}
}) => {
    const bodyRef = useRef(null);

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

                <div {...classes('body')} ref={bodyRef}>
                    <div {...classes('body-header')}>
                        <div {...classes('body-title-wrapper')}>
                            <h3 {...classes('body-title')}>{title}</h3>

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

                    {children}
                </div>
            </section>
        </Page>
    );
};

export default SettingsPage;
