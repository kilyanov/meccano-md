import React from 'react';
import {Draggable} from 'react-beautiful-dnd';
import './project-property.scss';
import ArrowIcon from '../../../Shared/SvgIcons/ArrowIcon';
import TrashIcon from '../../../Shared/SvgIcons/TrashIcon';

const classes = new Bem('project-property');

const Item = ({item, index, type, onDelete = () => {}}) => (
    <Draggable
        key={item.code}
        draggableId={item.code}
        index={index}
    >
        {(provided, snapshot) => (
            <div
                {...classes('', {dragging: snapshot.isDragging})}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                ref={provided.innerRef}
            >
                <div {...classes('arrows')}>
                    <ArrowIcon {...classes('arrow-top')}/>
                    <ArrowIcon {...classes('arrow-bottom')}/>
                </div>

                {item.name}

                {type === 'fields' && (
                    <button
                        {...classes('remove-button')}
                        onClick={() => onDelete(item, index)}
                    >
                        <TrashIcon {...classes('trash-icon')}/>
                    </button>
                )}
            </div>
        )}
    </Draggable>
);

export default Item;
