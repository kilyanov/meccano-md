import React from 'react';
import {Link} from 'react-router-dom';
import PropTypes from 'prop-types';
import EarthIcon from './icons/EarthIcon';
import ArrowIcon from './icons/ArrowIcon';
import './style.scss';

const classes = new Bem('project-list');

const ProjectList = ({list}) => (
    <ul {...classes()}>
        {(list || []).map((item, itemKey) => (
            <li {...classes('item')} key={itemKey}>
                <Link to='/' {...classes('item-link')}>
                    <EarthIcon {...classes('earth-icon')}/>
                    <span {...classes('item-title')}>{item.name}</span>
                    <ArrowIcon {...classes('arrow-icon')}/>
                </Link>
            </li>
        ))}
    </ul>
);

ProjectList.propTypes = {
    list: PropTypes.array
};

export default ProjectList;
