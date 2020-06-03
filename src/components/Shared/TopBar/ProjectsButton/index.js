import React from 'react';
import { useSelector } from 'react-redux';
import ProjectsIcon from "../../SvgIcons/ProjectsIcon";
import './projects-button.scss';
import TopBarButton from "../TopBarButton";

const ProjectsButton = ({ className }) => {
    const projects = useSelector(state => state.projects);

    return (
        <TopBarButton
            title='Проекты'
            withList
            IconComponent={ProjectsIcon}
            options={projects}
            className={className}
        />
    );
};

export default ProjectsButton;
