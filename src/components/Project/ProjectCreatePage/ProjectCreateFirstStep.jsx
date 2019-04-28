import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DragDropContext } from 'react-beautiful-dnd';
import ProjectPropertiesList from './ProjectPropertiesList/ProjectPropertiesList';

class ProjectCreateFirstStep extends Component {
    static propTypes = {
        classes: PropTypes.func.isRequired,
        project: PropTypes.object.isRequired,
        fields: PropTypes.array.isRequired,
        allFields: PropTypes.array.isRequired
    };

    handleDragEnd = (res) => {
        const { source, destination } = res;

        // dropped outside the list
        if (!destination) {
            return;
        }

        if (source.droppableId === destination.droppableId) {
            const items = this.reorder(
                this.props[source.droppableId],
                source.index,
                destination.index,
            );

            this.props.onChange({ [source.droppableId]: items });
        } else {
            const result = this.move(
                this.props[source.droppableId],
                this.props[destination.droppableId],
                source,
                destination,
            );

            this.props.onChange(result);
        }
    };

    reorder = (list, startIndex, endIndex) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);

        result.splice(endIndex, 0, removed);

        return result;
    };

    /**
     * Moves an item from one list to another list.
     */
    move = (source, destination, droppableSource, droppableDestination) => {
        const sourceClone = Array.from(source);
        const destClone = Array.from(destination);
        const [removed] = sourceClone.splice(droppableSource.index, 1);

        destClone.splice(droppableDestination.index, 0, removed);

        const result = {};

        result[droppableSource.droppableId] = sourceClone;
        result[droppableDestination.droppableId] = destClone;

        return result;
    };

    render() {
        const { classes } = this.props;

        return (
            <div {...classes('step', '', 'container')}>
                <DragDropContext onDragEnd={this.handleDragEnd}>
                    <div {...classes('row', '', 'row')}>
                        <div {...classes('column', '', 'col-xs-6')}>
                            <h3>Выбранные поля</h3>

                            <ProjectPropertiesList
                                droppableId="fields"
                                data={this.props.fields}
                                {...this.props}
                            />
                        </div>
                        <div {...classes('column', '', 'col-xs-6')}>
                            <h3>Добавление полей</h3>

                            <ProjectPropertiesList
                                droppableId="allFields"
                                data={this.props.allFields}
                                {...this.props}
                            />
                        </div>
                    </div>
                </DragDropContext>
            </div>
        );
    }
}

export default ProjectCreateFirstStep;
