import React, {useEffect, useRef, useState} from 'react';
import {useSelector} from 'react-redux';
import ProjectsIcon from "../../SvgIcons/ProjectsIcon";
import {Link} from "react-router-dom";
import './projects-button.scss';

const namespace = 'projects-button';
const cls = new Bem(namespace);
const ProjectsButton = ({className}) => {
    const projects = useSelector(state => state.projects);
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef(null);
    useEffect(() => {
        document.addEventListener('click', (event) => {
            if (buttonRef && buttonRef.current && !buttonRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        });
    }, []);


    return (
        <div
            {...cls('', {active: isOpen}, className)}
            ref={buttonRef}
            title='Проекты'
            onClick={(event) => {
                if (
                    event.target.classList.contains(namespace) ||
                    event.target.classList.contains('projects-button__icon')
                ) {
                    setIsOpen(!isOpen);
                }
            }}
        >
            <ProjectsIcon {...cls('icon')} />

            {isOpen && (
                <ul {...cls('list')}>
                    {projects.map(project => (
                        <li
                            {...cls('list-item')}
                            key={project.id}
                            title={project.name}
                        >
                            <Link
                                {...cls('link')}
                                to={`/project/${project.id}`}
                                onClick={() => setIsOpen(false)}
                            >{project.name}</Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ProjectsButton;
