import React from 'react';
import PropTypes from 'prop-types';
import './top-bar.scss';
import Logo from '../Logo/Logo';
// import NotificationsButton from './NotificationsButton/NotificationsButton';
import DocsButton from './DocsButton/DocsButton';
import ProjectsButton from "./ProjectsButton";
import ProfileButton from "./ProfileButton/ProfileButton";
import { clearCurrentProject } from "../../../redux/actions/currentProject";
import store from "../../../redux/store";
import ArchiveButton from "./ArchiveButton";
import { PROJECT_PERMISSION } from "../../../constants/ProjectPermissions";
import { clearCurrentArticle, clearCurrentArchive } from '../../../redux/actions';
import AccessProject from '../AccessProject';

const cls = new Bem('top-bar');
const TopBar = ({ isStatic, className }) => {
    const handleClickLogo = () => {
        store.dispatch(clearCurrentProject());
        store.dispatch(clearCurrentArticle());
        store.dispatch(clearCurrentArchive());
    }

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
        </section>
    );
};

TopBar.propTypes = {
    className: PropTypes.string,
    profile: PropTypes.object,
    isStatic: PropTypes.bool
};

export default TopBar;
