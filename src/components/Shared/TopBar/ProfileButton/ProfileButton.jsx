import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import ProfileIcon from "../../SvgIcons/ProfileIcon";
import ArrowIcon from "../../SvgIcons/ArrowIcon";
import {AuthService, StorageService} from "../../../../services";
import {EventEmitter} from "../../../../helpers";
import {STORAGE_KEY, EVENTS, THEME_TYPE} from "../../../../constants";
import './profile-button.scss';
import Switcher from "../../../Form/Switcher/Switcher";
import {switchTheme} from "../../../../redux/actions/theme";

const namespace = 'profile-button';
const cls = new Bem(namespace);
class ProfileButton extends Component {
    static propTypes = {
        userTypes: PropTypes.array,
        profile: PropTypes.object
    };

    state = {
        isOpen: false
    };

    componentDidMount() {
        document.addEventListener('click', this.handleClickOutside);
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.handleClickOutside);
    }

    handleClickOutside = (event) => {
        if (this.buttonRef && !this.buttonRef.contains(event.target) && this.state.isOpen) {
            this.setState({isOpen: false});
        }
    };

    handleChangeUserType = (userType) => {
        StorageService.set(STORAGE_KEY.USER_TYPE, JSON.stringify(userType));
        EventEmitter.emit(EVENTS.USER.CHANGE_TYPE, userType);
        this.forceUpdate();
    };

    handleSwitchTheme = () => {
        const {theme} = this.props;

        StorageService.set('theme', THEME_TYPE[theme.toUpperCase()] === 'light' ? THEME_TYPE.DARK : THEME_TYPE.LIGHT);
        this.props.onSwitchTheme();
    };

    getCurrentUserType = () => {
        const storageValue = StorageService.get(STORAGE_KEY.USER_TYPE);
        let userType = null;

        if (storageValue) {
            userType = JSON.parse(storageValue);
        }

        return userType;
    };

    render() {
        const {profile, userTypes, currentProject, theme} = this.props;
        const {isOpen} = this.state;
        const storageUserType = this.getCurrentUserType();
        const projectUserTypes = _.get(currentProject, 'userProject.userProjectTypes', []);
        const userTypeMenu = [];

        if (userTypes.length && projectUserTypes.length) {
            const availableUserTypes = projectUserTypes.map(ut => {
                return userTypes.find(({id}) => ut.user_type_id === id);
            });

            availableUserTypes.forEach(userType => {
                userTypeMenu.unshift({
                    id: userType.id,
                    name: userType.name,
                    onClick: () => this.handleChangeUserType(userType)
                });
            });
        }

        return (
            <div
                {...cls()}
                ref={ref => this.buttonRef = ref}
            >
                <div
                    {...cls('button', {active: isOpen})}
                    onClick={() => this.setState({isOpen: !isOpen})}
                >
                    <ProfileIcon {...cls('icon')}/>

                    <div {...cls('data', '', 'd-none d-md-flex')}>
                        <span {...cls('name')}>{profile.username}</span>
                        <span {...cls('username')}>{profile.email}</span>
                    </div>
                    <ArrowIcon {...cls('drop-arrow')}/>
                </div>

                {isOpen && (
                    <ul {...cls('list')}>
                        {userTypeMenu.map((item, itemIndex) => {
                            const isActive = item.id === storageUserType.id;

                            return (
                                <li
                                    {...cls('list-item', {active: isActive})}
                                    key={itemIndex}
                                    onClick={() => item.onClick()}
                                >{isActive && <i {...cls('list-item-active')}>✔</i>} {item.name}</li>
                            );
                        })}

                        <li {...cls('list-item')}>
                            Темная тема

                            <Switcher
                                {...cls('switch-theme-button')}
                                checked={theme === THEME_TYPE.DARK}
                                onChange={this.handleSwitchTheme}
                            />
                        </li>

                        <li
                            {...cls('list-item')}
                            onClick={() => AuthService.logOut()}
                        >
                            Выйти
                        </li>
                    </ul>
                )}
            </div>
        );
    }
}

function mapStateToProps({userTypes, profile, currentProject, theme}) {
    return {
        userTypes,
        profile,
        currentProject,
        theme
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onSwitchTheme: () => dispatch(switchTheme())
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ProfileButton);
