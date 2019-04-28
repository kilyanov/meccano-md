import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Droppable } from 'react-beautiful-dnd';
import ProjectProperty from './ProjectProperty';
import './project-properties-list.scss';

const classes = new Bem('project-properties-list');

const getListStyle = isDraggingOver => ({
    background: isDraggingOver ? 'transparent' : 'transparent'
});

class ProjectPropertiesList extends Component {
    static propTypes = {
        droppableId: PropTypes.string.isRequired,
        data: PropTypes.arrayOf(PropTypes.shape()).isRequired
    };

    render() {
        const { droppableId, data, ...props } = this.props;

        return (
            <Droppable droppableId={droppableId}>
                {(provided, snapshot) => (
                    <div
                        {...classes()}
                        ref={provided.innerRef}
                        style={getListStyle(snapshot.isDraggingOver)}
                    >
                        {data.map((item, index) => (
                            <ProjectProperty
                                item={item}
                                index={index}
                                key={item.code}
                                {...props}
                            />
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        );
    }
}

export default ProjectPropertiesList;
