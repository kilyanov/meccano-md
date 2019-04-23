import React, { Component } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import NaturalDragAnimation from '../NaturalDragAnimation';
import './project-property.scss';

const classes = new Bem('project-property');

class Item extends Component {
    render() {
        const { item, index, ...props } = this.props;

        return (
            <Draggable
                key={item.id}
                draggableId={item.id}
                index={index}
            >
                {(provided, snapshot) => (
                    <NaturalDragAnimation
                        style={provided.draggableProps.style}
                        snapshot={snapshot}
                        {...props}
                    >
                        {style => (
                            <div
                                {...classes('', {
                                    dragging: snapshot.isDragging
                                })}
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={style}
                            >
                                {item.name}
                            </div>
                        )}
                    </NaturalDragAnimation>
                )}
            </Draggable>
        );
    }
}

export default Item;
