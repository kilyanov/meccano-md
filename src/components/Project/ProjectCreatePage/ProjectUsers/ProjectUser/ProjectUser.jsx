import React from 'react';
import BEMHelper from "react-bem-helper";
import ProfileIcon from "../../../../Shared/SvgIcons/ProfileIcon";
import InlineButton from "../../../../Shared/InlineButton/InlineButton";
import { useSelector } from "react-redux";
import { PROJECT_USER_PERMISSIONS, PROJECT_USER_TRANSMIT } from "../consts";
import './project-user.scss';

const cls = new BEMHelper('project-user');
const ProjectUser = ({ projectUser, onChange, onDelete }) => {
    const { user } = projectUser;
    const userTypes = useSelector(state => state.userTypes);
    let userTypesString = '';

    if (user.types && user.types.length) {
        userTypesString = userTypes.filter(({ id }) => {
            return user.types
                .find(t => t.id === id)
                .map(({ name }) => name)
                .join(', ');
        });
    }

    return (
        <div {...cls()}>
            <section {...cls('image')}>
                <ProfileIcon {...cls('icon')}/>
            </section>
            <section {...cls('data')}>
                <div {...cls('data-item')}>
                    <h3 {...cls('title')}>{user.username}</h3>
                    <span {...cls('subtitle')}>{userTypesString}</span>
                </div>
                <div {...cls('data-item')}>
                    <a {...cls('data-item-link')} href={`mailto:${user.email}`}>{user.email}</a>
                </div>
                <div {...cls('data-item', 'small')}>
                    <b>Разрешения:</b>{' '}
                    {PROJECT_USER_PERMISSIONS
                        .filter(({ id }) => projectUser[id])
                        .map(permission => permission.name)
                        .join(', ')
                    }
                </div>
                <div {...cls('data-item', 'small')}>
                    <b>Возжность передачи статей:</b>{' '}
                    {PROJECT_USER_TRANSMIT
                        .filter(({ id }) => projectUser[id])
                        .map(transmit => transmit.name)
                        .join(', ')
                    }
                </div>
            </section>
            <section {...cls('buttons')}>
                <InlineButton
                    {...cls('button')}
                    onClick={() => onChange(user)}
                    small
                >Изменить</InlineButton>

                <InlineButton
                    {...cls('button')}
                    onClick={() => onDelete(user)}
                    danger
                    small
                >Удалить</InlineButton>
            </section>
        </div>
    );
};

export default ProjectUser;
