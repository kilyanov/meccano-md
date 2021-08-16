import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import ProfileIcon from "../../SvgIcons/ProfileIcon";
import ArrowIcon from "../../SvgIcons/ArrowIcon";
import {AuthService, StorageService} from "../../../../services";
import {STORAGE_KEY, THEME_TYPE} from "../../../../constants";
import './profile-button.scss';
import Switcher from "../../../Form/Switcher/Switcher";
import { setUserType, switchTheme } from "../../../../redux/actions";

const namespace = 'profile-button';
const cls = new Bem(namespace);
class ProfileButton extends Component {
    static propTypes = {
        userTypes: PropTypes.array,
        profile: PropTypes.object
    };

    constructor(props) {
        super(props);

        this.state = {
            isOpen: false,
            autoSaveArticles: !!StorageService.get(STORAGE_KEY.AUTO_SAVE_ARTICLES)
        };
    }
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
        if (!userType) {
            return;
        }

        const { onSetUserType } = this.props;

        onSetUserType(userType);
    };

    handleSwitchTheme = () => {
        const {theme} = this.props;

        StorageService.set('theme', THEME_TYPE[theme.toUpperCase()] === 'light' ? THEME_TYPE.DARK : THEME_TYPE.LIGHT);
        this.props.onSwitchTheme();
    };

    handleSwitchAutoSave = () => {
        this.setState(state => {
            state.autoSaveArticles = !state.autoSaveArticles;

            if (state.autoSaveArticles) {
                StorageService.set(STORAGE_KEY.AUTO_SAVE_ARTICLES, 'true');
            } else {
                StorageService.remove(STORAGE_KEY.AUTO_SAVE_ARTICLES);
            }

            return state;
        });
    }

    render() {
        const {profile, userTypes, userType, currentProject, theme} = this.props;
        const {autoSaveArticles, isOpen} = this.state;
        const projectUserTypes = _.get(currentProject, 'userProject.userProjectTypes', []);
        const userTypeMenu = [];

        if (userTypes.length && projectUserTypes.length) {
            const availableUserTypes = projectUserTypes.map(ut => {
                return userTypes.find(({id}) => ut.user_type_id === id);
            });

            availableUserTypes.forEach(ut => {
                userTypeMenu.unshift({
                    id: ut.id,
                    name: ut.name,
                    onClick: () => this.handleChangeUserType(ut)
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
                            const isActive = item.id === (userType && userType.id);

                            return (
                                <li
                                    {...cls('list-item', {active: isActive})}
                                    key={itemIndex}
                                    onClick={() => item.onClick()}
                                >{isActive && <i {...cls('list-item-active')}>✔</i>} {item.name}</li>
                            );
                        })}

                        <li {...cls('list-item')}>
                            <div { ...cls('list-item-heading') }>
                                Темная тема
                            </div>

                            <Switcher
                                {...cls('switch-button')}
                                checked={theme === THEME_TYPE.DARK}
                                onChange={this.handleSwitchTheme}
                            />
                        </li>

                        <li {...cls('list-item')}>
                            <div { ...cls('list-item-heading') }>
                                Сохранять при переходе
                                <small>Автоматически сохранять статьи при переходе на следующую/предыдущую статью</small>
                            </div>

                            <Switcher
                                {...cls('switch-button')}
                                checked={autoSaveArticles}
                                onChange={this.handleSwitchAutoSave}
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

function mapStateToProps({userTypes, userType, profile, currentProject, theme}) {
    return {
        userTypes,
        userType,
        profile,
        currentProject,
        theme
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onSetUserType: (payload) => dispatch(setUserType(payload)),
        onSwitchTheme: () => dispatch(switchTheme())
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ProfileButton);
