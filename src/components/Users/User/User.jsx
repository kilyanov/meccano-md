import React from 'react';
import ProfileIcon from "../../Shared/SvgIcons/ProfileIcon";
import './user.scss';
import InlineButton from "../../Shared/InlineButton/InlineButton";

const cls = new Bem('user');
const User = ({user, onChange, onDelete}) => {
    return (
        <div {...cls()}>
            <section {...cls('image')}>
                <ProfileIcon {...cls('icon')}/>
            </section>
            <section {...cls('data')}>
                <div {...cls('data-item')}>
                    <h3 {...cls('title')}>{user.username}</h3>
                </div>
                <div {...cls('data-item')}>
                    <a {...cls('data-item-link')} href={`mailto:${user.email}`}>{user.email}</a>
                </div>
                <div {...cls('data-item', 'small')}>
                    {user.permissions.map(({description}) => description).join(', ')}
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
                    onClick={() => onDelete(user.id)}
                    danger
                    small
                >Удалить</InlineButton>
            </section>
        </div>
    );
};

export default User;
