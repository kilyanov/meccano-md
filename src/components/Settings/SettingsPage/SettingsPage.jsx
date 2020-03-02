import React, {useRef, useEffect} from 'react';
import Page from '../../Shared/Page/Page';
import {InitScrollbar} from '../../../helpers/Tools';
import './settings-page.scss';
import Button from '../../Shared/Button/Button';
import Loader from '../../Shared/Loader/Loader';
import InputText from '../../Form/InputText/InputText';
import MenuHamburger from '../../Shared/MenuHamburger/MenuHamburger';
import SettingsLeftSidebar from './SettingsLeftSidebar/SettingsLeftSidebar';
import Access from "../../Shared/Access/Access";
import {PERMISSION} from "../../../constants/Permissions";

const cls = new Bem('settings-page');

const SettingsPage = ({
    title,
    subtitle,
    children,
    withAddButton,
    inProgress,
    addButtonTitle = 'Добавить',
    onAdd = () => {},
    onEndPage = () => {},
    onSearch,
    searchQuery
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
        <Page title='Настройки' withBar {...cls()}>
            <div {...cls('header')}>
                <MenuHamburger />
            </div>

            <section {...cls('content')}>
                <SettingsLeftSidebar />

                <div
                    {...cls('body', {empty: !children})}
                    ref={bodyRef}
                    onScroll={handleScroll}
                >
                    {!!children && (
                        <div {...cls('body-header')}>
                            <div {...cls('body-header-row')}>
                                <div {...cls('body-title-wrapper')}>
                                    <h2 {...cls('body-title')}>{title}</h2>

                                    {subtitle && <h5 {...cls('body-subtitle')}>{subtitle}</h5>}
                                </div>

                                {withAddButton && (
                                    <Access permissions={[PERMISSION.editSettings]}>
                                        <Button
                                            {...cls('button', 'add')}
                                            text={addButtonTitle}
                                            onClick={onAdd}
                                        />
                                    </Access>
                                )}
                            </div>

                            {!!onSearch && (
                                <InputText
                                    {...cls('search-field')}
                                    placeholder='Поиск...'
                                    clearable
                                    onChange={onSearch}
                                    value={searchQuery}
                                />
                            )}
                        </div>
                    )}

                    {children}

                    {!children && (
                        <div {...cls('stub')}>
                            <h2>Настройки</h2>
                            <h5>Выберите пункт меню слева</h5>
                        </div>
                    )}
                </div>

                {inProgress && <Loader {...cls('loader')}/>}
            </section>
        </Page>
    );
};

export default SettingsPage;
