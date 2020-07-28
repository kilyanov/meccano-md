import React from 'react';
import SectionTreeItem from './SectionTreeItem/SectionTreeItem';
import Sortable from 'react-sortablejs';
import './section-tree-list.scss';

const cls = new Bem('section-tree-list');

export default function SectionTreeList({ parent, items, level, onAddItemChild, onEditItem, onDeleteItem, onSorting }) {
    const sortedItems = items.sort((a, b) => a.position - b.position);

    return (
        <Sortable
            {...cls()}
            tag='ul'
            onChange={sorted => onSorting(sorted, parent, level)}
            options={{
                group: 'nested',
                animation: 150,
                filter: '.ps__rail-y',
                fallbackOnBody: true,
                swapThreshold: 0.65
            }}
        >
            {sortedItems.map((item, itemIndex) => (
                <SectionTreeItem
                    parent={parent}
                    item={item}
                    key={itemIndex}
                    cls={cls}
                    level={level}
                    onAddChild={onAddItemChild}
                    onEdit={onEditItem}
                    onDelete={onDeleteItem}
                    onSortChildren={onSorting}
                />
            ))}
        </Sortable>
    );
}