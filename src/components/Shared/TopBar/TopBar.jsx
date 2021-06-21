import React from 'react';
import PropTypes from 'prop-types';
import './top-bar.scss';
import Logo from '../Logo/Logo';
// import NotificationsButton from './NotificationsButton/NotificationsButton';
import DocsButton from './DocsButton/DocsButton';
import ProjectsButton from "./ProjectsButton";
import ProfileButton from "./ProfileButton/ProfileButton";
import { clearCurrentProject } from "../../../redux/actions";
import store from "../../../redux/store";
import ArchiveButton from "./ArchiveButton";
import { PROJECT_PERMISSION } from "../../../constants";
import { clearCurrentArticle, clearCurrentArchive } from '../../../redux/actions';
import AccessProject from '../AccessProject';
import { useSelector } from 'react-redux';
import LinearLoader from '../LinearLoader/LinearLoader';
import Portal from '../Portal/Portal';

const cls = new Bem('top-bar');
const TopBar = ({ isStatic, className }) => {
    const appProgress = useSelector(state => state.appProgress);
    const handleClickLogo = () => {
        store.dispatch(clearCurrentProject());
        store.dispatch(clearCurrentArticle());
        store.dispatch(clearCurrentArchive());
    };

    return (
        <section {...cls('', { static: isStatic }, className)}>
            <div {...cls('container', '', 'container')}>
                <Logo onClick={handleClickLogo}/>

                <section {...cls('buttons')}>
                    <AccessProject permissions={ PROJECT_PERMISSION.ACCESS_ARCHIVE }>
                        <ArchiveButton {...cls('button', 'archive')} />
                    </AccessProject>
                    <ProjectsButton {...cls('button', 'notifications')} />
                    <DocsButton {...cls('button', 'notifications')} />
                    {/* <NotificationsButton {...cls('button', 'notifications')} /> */}
                </section>

                <ProfileButton {...cls('button')} />
            </div>

            { appProgress.inProgress && (
                <LinearLoader { ...cls('app-loader') } />
            ) }

            { appProgress.withBlockedOverlay && (
                <Portal>
                    <div { ...cls('app-overlay') } />
                </Portal>
            ) }
        </section>
    );
};

TopBar.propTypes = {
    className: PropTypes.string,
    profile: PropTypes.object,
    isStatic: PropTypes.bool
};

export default TopBar;
