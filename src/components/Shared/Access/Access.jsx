import React from 'react';
import {isAccess, isProjectAccess, isRolesAccees} from "../../../helpers/Tools";
import {PERMISSION} from "../../../constants/Permissions";
import {EventEmitter} from "../../../helpers";
import {EVENTS} from "../../../constants";

const Access = ({permissions, roles, children, replaceComponent, redirect}) => {
    const canByProfilePermissions = !permissions || permissions.includes(PERMISSION.all) || isAccess(permissions || []);
    const canByProjectPermissions = isProjectAccess(permissions);
    const canByRoles = isRolesAccees(roles);

    // console.log('************************');
    // console.log('permissions', permissions);
    // console.log('canByProfilePermissions', canByProfilePermissions);
    // console.log('canByProjectPermissions', canByProjectPermissions);
    // console.log('canByRoles', canByRoles);
    // console.log('************************');

    const canRender = canByProfilePermissions || canByProjectPermissions || canByRoles;
    if (!canRender && redirect) {
        EventEmitter.emit(EVENTS.REDIRECT, redirect);
    }

    return canRender ? <>{children}</> : replaceComponent || null;
};

export default Access;
