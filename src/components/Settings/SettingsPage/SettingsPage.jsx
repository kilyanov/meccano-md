import React from 'react';
import Page from '../../Shared/Page/Page';
import './settings-page.scss';
import Button from '../../Shared/Button/Button';
import Loader from '../../Shared/Loader/Loader';
import InputText from '../../Form/InputText/InputText';
import MenuHamburger from '../../Shared/MenuHamburger/MenuHamburger';
import SettingsLeftSidebar from './SettingsLeftSidebar/SettingsLeftSidebar';
import Access from "../../Shared/Access/Access";
import { PERMISSION } from "../../../constants";
import DropDownButton from "../../Shared/DropDownButton/DropDownButton";

const cls = new Bem('settings-page');

const SettingsPage = ({
    title,
    subtitle,
    children,
    dropDownButton,
    withAddButton,
    inProgress,
    addButtonTitle = 'Добавить',
    additionalButtons,
    onAdd = () => {},
    onEndPage = () => {},
    onSearch,
    searchQuery,
    rightBlock = null
}) => {
    const handleScroll = event => {
        const { target } = event;
        const isEndPage = target.scrollTop === target.scrollHeight - target.clientHeight;

        if (isEndPage) onEndPage();
    };

    return (
        <Access
            permissions={[ PERMISSION.viewSettings, PERMISSION.editSettings ]}
            redirect='/'
        >
            <Page title='Настройки' withBar {...cls()}>
                <div {...cls('header')}>
                    <MenuHamburger/>
                </div>

                <section {...cls('content')}>
                    <SettingsLeftSidebar/>

                    <div
                        {...cls('body', { empty: !children })}
                        onScroll={handleScroll}
                    >
                        {!!children && (
                            <div {...cls('body-header')}>
                                <div {...cls('body-header-row')}>
                                    <div {...cls('body-title-wrapper')}>
                                        <h2 {...cls('body-title')}>{title}</h2>

                                        {subtitle && <h5 {...cls('body-subtitle')}>{subtitle}</h5>}
                                    </div>

                                    <section { ...cls('buttons') }>
                                        {!!additionalButtons?.length && (
                                            <Access permissions={[ PERMISSION.editSettings ]}>
                                                {additionalButtons.map((button, buttonIndex) => (
                                                    <Button
                                                        { ...cls('button') }
                                                        key={buttonIndex}
                                                        text={button.title}
                                                        onClick={() => button.onClick()}
                                                        style={button.style}
                                                    />
                                                ))}
                                            </Access>
                                        )}

                                        {rightBlock}

                                        {(withAddButton || dropDownButton) && (
                                            <Access permissions={[ PERMISSION.editSettings ]}>
                                                {dropDownButton ? (
                                                    <DropDownButton
                                                        {...cls('button', 'add')}
                                                        {...dropDownButton}
                                                    />
                                                ) : (
                                                    <Button
                                                        {...cls('button', 'add')}
                                                        text={addButtonTitle}
                                                        onClick={onAdd}
                                                    />
                                                )}
                                            </Access>
                                        )}
                                    </section>
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
        </Access>
    );
};

export default SettingsPage;
