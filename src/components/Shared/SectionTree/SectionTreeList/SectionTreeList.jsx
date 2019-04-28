import React, {Component} from 'react';
import PropTypes from 'prop-types';
import './section-tree-list.scss';
import SectionTreeItem from './SectionTreeItem/SectionTreeItem';
import {DragDropContext} from 'react-beautiful-dnd';

const classes = new Bem('section-tree-list');

export default class SectionTreeList extends Component {
    static propTypes = {
        parent: PropTypes.object,
        items: PropTypes.array.isRequired,
        level: PropTypes.number,
        onAddItemChild: PropTypes.func.isRequired,
        onEditItem: PropTypes.func.isRequired,
        onDeleteItem: PropTypes.func.isRequired
    };

    handleDragEnd = () => {
        console.log('drag end');
    };

    render() {
        const {parent, items, level, onAddItemChild, onEditItem, onDeleteItem} = this.props;

        return (
            <DragDropContext onDragEnd={this.handleDragEnd}>
                <ul {...classes()}>
                    {items.map((item, itemIndex) => (
                        <SectionTreeItem
                            parent={parent}
                            item={item}
                            key={itemIndex}
                            classes={classes}
                            level={level}
                            onAddChild={onAddItemChild}
                            onEdit={onEditItem}
                            onDelete={onDeleteItem}
                        />
                    ))}
                </ul>
            </DragDropContext>
        );
    }
}
