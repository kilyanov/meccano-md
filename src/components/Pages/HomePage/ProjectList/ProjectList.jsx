import React from 'react';
import {Link} from 'react-router-dom';
import PropTypes from 'prop-types';
import EarthIcon from './icons/EarthIcon';
import ArrowIcon from './icons/ArrowIcon';
import './project-list.scss';

const classes = new Bem('project-list');

const ProjectList = ({list, onClick = () => {}}) => (
    <ul {...classes()}>
        {(list || []).map((item, itemKey) => (
            <li {...classes('item')} key={itemKey}>
                <Link to='/' {...classes('item-link')} onClick={() => onClick(item.name)}>
                    <EarthIcon {...classes('earth-icon')}/>
                    <span {...classes('item-title')}>{item.name}</span>
                    <ArrowIcon {...classes('arrow-icon')}/>
                </Link>
            </li>
        ))}
    </ul>
);

ProjectList.propTypes = {
    list: PropTypes.array,
    onClick: PropTypes.func
};

export default ProjectList;
