import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import ProfileIcon from "../../SvgIcons/ProfileIcon";
import ArrowIcon from "../../SvgIcons/ArrowIcon";
import {AuthService, StorageService} from "../../../../services";
import {EventEmitter} from "../../../../helpers";
import {STORAGE_KEY, EVENTS} from "../../../../constants";
import './profile-button.scss';

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

    handleChangeUserType = (typeId) => {
        StorageService.set(STORAGE_KEY.USER_TYPE, typeId);
        EventEmitter.emit(EVENTS.USER.CHANGE_TYPE, typeId);
        this.forceUpdate();
    };

    render() {
        const {profile, userTypes, currentProject} = this.props;
        const {isOpen} = this.state;
        const storageUserType = StorageService.get(STORAGE_KEY.USER_TYPE);
        const projectUserTypes = _.get(currentProject, 'userProject.userProjectTypes', []);
        const menu = [{name: 'Выйти', onClick: AuthService.logOut}];

        if (userTypes.length && projectUserTypes.length) {
            const availableUserTypes = projectUserTypes.map(ut => {
                return userTypes.find(({id}) => ut.user_type_id === id);
            });

            availableUserTypes.forEach(({name, id}) => {
                menu.unshift({
                    id,
                    name,
                    onClick: () => this.handleChangeUserType(id)
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
                        {menu.map((item, itemIndex) => {
                            const isActive = item.id === storageUserType;

                            return (
                                <li
                                    {...cls('list-item', {active: isActive})}
                                    key={itemIndex}
                                    onClick={() => item.onClick()}
                                >{isActive && <i {...cls('list-item-active')}>✔</i>} {item.name}</li>
                            );
                        })}
                    </ul>
                )}
            </div>
        );
    }
}

function mapStateToProps({userTypes, profile, currentProject}) {
    return {
        userTypes,
        profile,
        currentProject
    };
}

export default connect(mapStateToProps)(ProfileButton);
