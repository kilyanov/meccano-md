import React, { Component } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import './project-property.scss';
import ArrowIcon from '../../../Shared/SvgIcons/ArrowIcon';
import TrashIcon from '../../../Shared/SvgIcons/TrashIcon';

const classes = new Bem('project-property');

class Item extends Component {
    render() {
        const { item, index } = this.props;

        return (
            <Draggable
                key={item.code}
                draggableId={item.code}
                index={index}
            >
                {(provided, snapshot) => (
                    <div
                        {...classes('', {
                            dragging: snapshot.isDragging
                        })}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                    >
                        <div {...classes('arrows')}>
                            <ArrowIcon {...classes('arrow-top')}/>
                            <ArrowIcon {...classes('arrow-bottom')}/>
                        </div>

                        {item.name}

                        <button
                            {...classes('remove-button')}
                        >
                            <TrashIcon {...classes('trash-icon')}/>
                        </button>
                    </div>
                )}
            </Draggable>
        );
    }
}

export default Item;
