import React from 'react';
import SectionTreeItem from './SectionTreeItem/SectionTreeItem';
import Sortable from 'react-sortablejs';
import './section-tree-list.scss';

const cls = new Bem('section-tree-list');

export default function SectionTreeList({
    opened = true,
    parent,
    items,
    level,
    onAddItemChild,
    onEditItem,
    onDeleteItem,
    onCopyItem,
    onSorting
}) {
    const sortedItems = items.sort((a, b) => a.position - b.position);

    return (
        <Sortable
            {...cls('', { opened })}
            tag='ul'
            onChange={sorted => onSorting(sorted, parent, level)}
            options={{
                group: 'nested',
                animation: 150,
                filter: '.ps__rail-y',
                handle: '.section-tree-list__item-arrows',
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
                    onCopy={onCopyItem}
                    onSortChildren={onSorting}
                />
            ))}
        </Sortable>
    );
}
