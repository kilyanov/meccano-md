import React from 'react';
import {useSelector} from 'react-redux';
import ProfileIcon from "../../Shared/SvgIcons/ProfileIcon";
import InlineButton from "../../Shared/InlineButton/InlineButton";
import Access from "../../Shared/Access/Access";
import {PERMISSION} from "../../../constants/Permissions";
import './user.scss';

const cls = new Bem('user');
const User = ({user, onChange, onDelete}) => {
    const userTypes = useSelector(state => state.userTypes);
    let userTypesString = '';

    if (user.types && user.types.length) {
        userTypesString = userTypes.filter(({id}) => user.types.find(t => t.id === id)).map(({name}) => name).join(', ');
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
                    {/* {user.permissions.map(({description}) => description).join(', ')} */}
                </div>
            </section>
            <section {...cls('buttons')}>
                <Access permissions={[PERMISSION.editUsers]}>
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
                </Access>
            </section>
        </div>
    );
};

export default User;
