import React from 'react';
import {} from 'react-redux';
import {isAccess, isProjectAccess, isRolesAccess} from "../../../helpers/Tools";
import {PERMISSION} from "../../../constants/Permissions";
import {EventEmitter} from "../../../helpers";
import {EVENTS} from "../../../constants";
import {useSelector} from "react-redux";
import Loader from "../Loader/Loader";

const Access = ({permissions, roles, children, replaceComponent, redirect}) => {
    const profile = useSelector(state => state.profile);

    if (_.isEmpty(profile)) {
        return <Loader />;
    }

    const canByProfilePermissions = !permissions
        || permissions.includes(PERMISSION.all)
        || isAccess(permissions || [], profile);
    const canByProjectPermissions = isProjectAccess(permissions);
    const canByRoles = isRolesAccess(roles);
    const canRender = canByProfilePermissions || canByProjectPermissions || canByRoles;

    // console.log({canByProfilePermissions, canByProjectPermissions, canByRoles, canRender, profile});

    if (!canRender && redirect) {
        EventEmitter.emit(EVENTS.REDIRECT, redirect);
    }

    return canRender ? <>{children}</> : replaceComponent || null;
};

export default Access;
