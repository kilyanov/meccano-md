import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Droppable} from 'react-beautiful-dnd';
import ProjectProperty from './ProjectProperty';
import './project-properties-list.scss';
import {InitScrollbar} from '../../../../helpers/Tools';

const classes = new Bem('project-properties-list');

const getListStyle = isDraggingOver => ({
    background: isDraggingOver ? 'transparent' : 'transparent'
});

class ProjectPropertiesList extends Component {
    static propTypes = {
        droppableId: PropTypes.string.isRequired,
        data: PropTypes.arrayOf(PropTypes.shape()).isRequired,
        onDelete: PropTypes.func
    };

    componentDidMount() {
        InitScrollbar(this.ref);
    }

    render() {
        const {droppableId, data, onDelete, ...props} = this.props;

        return (
            <Droppable droppableId={droppableId}>
                {(provided, snapshot) => (
                    <div
                        {...classes()}
                        ref={ref => {
                            this.ref = ref;
                            provided.innerRef(ref);
                        }}
                        style={getListStyle(snapshot.isDraggingOver)}
                    >
                        {data.map((item, index) => (
                            <ProjectProperty
                                item={item}
                                type={droppableId}
                                index={index}
                                key={item.code}
                                onDelete={onDelete}
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
