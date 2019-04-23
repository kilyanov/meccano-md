import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DragDropContext } from 'react-beautiful-dnd';
import ProjectPropertiesList from './ProjectPropertiesList/ProjectPropertiesList';

class ProjectCreateFirstStep extends Component {
    static propTypes = {
        classes: PropTypes.func.isRequired,
        project: PropTypes.object.isRequired
    };

    state = {
        items: [
            { id: 1, name: 'Первый' },
            { id: 2, name: 'Второй' },
            { id: 3, name: 'Третий' },
            { id: 4, name: 'Четвертый' },
            { id: 5, name: 'Пятый' },
            { id: 6, name: 'Шестой' },
            { id: 7, name: 'Седьмой' }
        ],
        selected: []
    };

    handleDragEnd = (res) => {
        const { source, destination } = res;

        // dropped outside the list
        if (!destination) {
            return;
        }

        if (source.droppableId === destination.droppableId) {
            const items = this.reorder(
                this.getList(source.droppableId),
                source.index,
                destination.index,
            );

            let state = { items };

            if (source.droppableId === 'selected') {
                state = { selected: items };
            }

            this.setState(state);
        } else {
            const result = this.move(
                this.getList(source.droppableId),
                this.getList(destination.droppableId),
                source,
                destination,
            );

            this.setState({...this.state, ...result});
        }
    };

    getList = id => this.state[id];

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
                                droppableId="selected"
                                data={this.state.selected}
                                {...this.props}
                            />
                        </div>
                        <div {...classes('column', '', 'col-xs-6')}>
                            <h3>Добавление полей</h3>

                            <ProjectPropertiesList
                                droppableId="items"
                                data={this.state.items}
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
