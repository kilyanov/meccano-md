import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import './top-bar.scss';
import Logo from '../Logo/Logo';
import ProfileIcon from '../SvgIcons/ProfileIcon';
import ArrowIcon from '../SvgIcons/ArrowIcon';
import DropDown from '../DropDown/DropDown';
import {AuthService} from '../../../services';

const classes = new Bem('top-bar');

export default class TopBar extends PureComponent {
    static propTypes = {
        className: PropTypes.string
    };

    profileMenuItems = [{
        title: 'Профиль',
        onClick: () => {},
        closeOnClick: true
    }, {
        title: 'Выйти',
        onClick: AuthService.logOut
    }];

    render() {
        const profileIsOpen = this.dropdown && this.dropdown.isOpen();

        return (
            <section {...classes('', '', this.props.className)}>
                <div {...classes('container', '', 'container')}>
                    <Logo/>
                    <div {...classes('profile', {opened: profileIsOpen})}>
                        <div
                            {...classes('profile-button')}
                            onClick={() => this.dropdown.toggle()}
                        >
                            <ProfileIcon {...classes('profile-icon')}/>
                            <div {...classes('profile-data')}>
                                <span {...classes('profile-name')}>M_username</span>
                                <span {...classes('profile-username')}>User Name</span>
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
