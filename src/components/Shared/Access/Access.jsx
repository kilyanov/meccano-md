import React from 'react';
import {useSelector} from 'react-redux';
import {isAccess} from "../../../helpers/Tools";
import {PERMISSION} from "../../../constants/Permissions";
import {EventEmitter} from "../../../helpers";
import {EVENTS} from "../../../constants";

const Access = ({permissions, children, replaceComponent, redirect}) => {
    const profile = useSelector(state => state.profile);
    const canRender = !permissions || permissions.includes(PERMISSION.all) ||
        isAccess(permissions || [], profile);

    if (!canRender && redirect) {
        EventEmitter.emit(EVENTS.REDIRECT, redirect)
    }

    return canRender ? <>{children}</> : replaceComponent || null;
};

export default Access;
