import React from 'react';
import { isProjectAccess } from "../../../helpers/Tools";
import { EventEmitter } from "../../../helpers";
import { EVENTS } from "../../../constants";
import { useSelector } from "react-redux";
import Loader from "../Loader/Loader";

export default function AccessProject({ permissions, children, replaceComponent = null, redirect }) {
    const profile = useSelector(state => state.profile);
    const currentProject = useSelector(state => state.currentProject);

    if (_.isEmpty(profile)) {
        return <Loader/>;
    }

    const canByProjectPermissions = isProjectAccess(permissions);
    const canRender = !permissions || canByProjectPermissions;


    if (!canRender && redirect && currentProject) {
        EventEmitter.emit(EVENTS.REDIRECT, redirect);
    }

    return canRender ? <>{children}</> : replaceComponent || null;
};
