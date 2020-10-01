import React from 'react';
import { isRolesAccess } from "../../../helpers/Tools";
import { EventEmitter } from "../../../helpers";
import { EVENTS } from "../../../constants";
import { useSelector } from "react-redux";
import Loader from "../Loader/Loader";

export default function AccessRoles({roles, children, replaceComponent, redirect }) {
    const profile = useSelector(state => state.profile);

    if (_.isEmpty(profile)) {
        return <Loader/>;
    }

    const canByRoles = isRolesAccess(roles);
    const canRender = !roles || canByRoles;


    if (!canRender && redirect) {
        EventEmitter.emit(EVENTS.REDIRECT, redirect);
    }

    return canRender ? <>{children}</> : replaceComponent || null;
};
