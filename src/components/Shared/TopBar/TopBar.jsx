import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import './top-bar.scss';
import Logo from '../Logo/Logo';
import ProfileIcon from '../SvgIcons/ProfileIcon';
import ArrowIcon from '../SvgIcons/ArrowIcon';
import DropDown from '../DropDown/DropDown';
import {AuthService} from '../../../services';

const classes = new Bem('top-bar');

class TopBar extends PureComponent {
    static propTypes = {
        className: PropTypes.string,
        profile: PropTypes.object
    };

    profileMenuItems = [{
        title: 'Выйти',
        onClick: AuthService.logOut
    }];

    // {
    //     title: 'Профиль',
    //     onClick: () => {},
    //     closeOnClick: true
    // },

    render() {
        const {profile} = this.props;
        const profileIsOpen = this.dropdown && this.dropdown.isOpen();

        return (
            <section {...classes('', '', this.props.className)}>
                <div {...classes('container', '', 'container')}>
                    <Logo/>
                    <div {...classes('profile', {opened: profileIsOpen})}>
                        <div
                            {...classes('profile-button')}
                            onClick={() => this.dropdown.toggle({style: {right: 0, width: '100%'}})}
                        >
                            <ProfileIcon {...classes('profile-icon')}/>
                            <div {...classes('profile-data', '', 'd-none d-md-flex')}>
                                <span {...classes('profile-name')}>{profile.username}</span>
                                <span {...classes('profile-username')}>{profile.email}</span>
                            </div>
                            <ArrowIcon {...classes('drop-arrow')}/>
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
