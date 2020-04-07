import React from 'react';
import {EventEmitter} from "../../../helpers";
import {EVENTS} from "../../../constants";
import {isProjectAccess} from "../../../helpers/Tools";

const ProjectAccess = ({permissions, children, replaceComponent, redirect}) => {
    const canRender = !permissions || isProjectAccess(permissions);

    if (!canRender && redirect) {
        EventEmitter.emit(EVENTS.REDIRECT, redirect);
    }

    return canRender ? <>{children}</> : replaceComponent || null;
};

export default ProjectAccess;
