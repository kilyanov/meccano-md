import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import './top-bar.scss';
import Logo from '../Logo/Logo';
import ProfileIcon from '../SvgIcons/ProfileIcon';
import ArrowIcon from '../SvgIcons/ArrowIcon';
import DropDown from '../DropDown/DropDown';
import {AuthService} from '../../../services';
import NotificationsButton from './NotificationsButton/NotificationsButton';
import ThemeButton from './ThemeButton/ThemeButton';
import DocsButton from './DocsButton/DocsButton';

const cls = new Bem('top-bar');

class TopBar extends PureComponent {
    static propTypes = {
        className: PropTypes.string,
        profile: PropTypes.object,
        static: PropTypes.bool
    };

    profileMenuItems = [{
        title: 'Выйти',
        onClick: AuthService.logOut
    }];

    render() {
        const {profile} = this.props;
        const profileIsOpen = this.dropdown && this.dropdown.isOpen();

        return (
            <section {...cls('', {static: this.props.static}, this.props.className)}>
                <div {...cls('container', '', 'container')}>
                    <Logo/>

                    <section {...cls('buttons')}>
                        <ThemeButton {...cls('button', 'notifications')} />
                        {/* <DocsButton {...cls('button', 'notifications')} /> */}
                        <NotificationsButton {...cls('button', 'notifications')} />
                    </section>

                    <div {...cls('profile', {opened: profileIsOpen})}>
                        <div
                            {...cls('profile-button')}
                            onClick={() => this.dropdown.toggle({style: {right: 0, width: '100%'}})}
                        >
                            <ProfileIcon {...cls('profile-icon')}/>
                            <div {...cls('profile-data', '', 'd-none d-md-flex')}>
                                <span {...cls('profile-name')}>{profile.username}</span>
                                <span {...cls('profile-username')}>{profile.email}</span>
                            </div>
                            <ArrowIcon {...cls('drop-arrow')}/>
                        </div>

                        <DropDown
                            ref={node => this.dropdown = node}
                            items={this.profileMenuItems}
                            ignoreOutsideClickClass='top-bar__profile-button'
                            onOpen={() => this.forceUpdate()}
                            onClose={() => this.forceUpdate()}
                        />
                    </div>
                </div>
            </section>
        );
    }
}

export default connect(({profile}) => ({profile}))(TopBar);
