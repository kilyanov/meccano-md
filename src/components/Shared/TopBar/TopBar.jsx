import React from 'react';
import PropTypes from 'prop-types';
import './top-bar.scss';
import Logo from '../Logo/Logo';
import NotificationsButton from './NotificationsButton/NotificationsButton';
import DocsButton from './DocsButton/DocsButton';
import ProjectsButton from "./ProjectsButton/ProjectsButton";
import ProfileButton from "./ProfileButton/ProfileButton";

const cls = new Bem('top-bar');
const TopBar = ({isStatic, className}) => {
    return (
        <section {...cls('', {static: isStatic}, className)}>
            <div {...cls('container', '', 'container')}>
                <Logo/>

                <section {...cls('buttons')}>
                    <ProjectsButton {...cls('button', 'notifications')} />
                    <DocsButton {...cls('button', 'notifications')} />
                    {/* <NotificationsButton {...cls('button', 'notifications')} /> */}
                </section>

                <ProfileButton {...cls('button')} />
            </div>
        </section>
    );
}

TopBar.propTypes = {
    className: PropTypes.string,
    profile: PropTypes.object,
    isStatic: PropTypes.bool
};

export default TopBar;
