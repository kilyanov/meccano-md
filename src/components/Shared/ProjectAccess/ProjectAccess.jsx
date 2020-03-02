import React from 'react';
import {useSelector} from 'react-redux';
import {EventEmitter} from "../../../helpers";
import {EVENTS} from "../../../constants";
import {isProjectAccess} from "../../../helpers/Tools";

const ProjectAccess = ({permissions, children, replaceComponent, redirect}) => {
    const currentProject = useSelector(state => state.currentProject);
    const userProject = currentProject && currentProject.userProject;
    const canRender = !permissions || isProjectAccess(permissions, userProject);

    if (!canRender && redirect) {
        EventEmitter.emit(EVENTS.REDIRECT, redirect)
    }

    return canRender ? <>{children}</> : replaceComponent || null;
};

export default ProjectAccess;
