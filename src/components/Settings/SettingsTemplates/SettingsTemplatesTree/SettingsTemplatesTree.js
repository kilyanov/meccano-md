import React, {useCallback, useMemo, useState} from 'react';
import Sortable from "react-sortablejs";
import PencilIcon from "../../../Shared/SvgIcons/PencilIcon";
import TrashIcon from "../../../Shared/SvgIcons/TrashIcon";
import Access from "../../../Shared/Access/Access";
import FolderIcon from "../../../Shared/SvgIcons/FolderIcon";
import FolderOpenIcon from "../../../Shared/SvgIcons/FolderOpenIcon";
import DocumentIcon from "../../../Shared/SvgIcons/DocumentIcon";
import DragDotsIcon from "../../../Shared/SvgIcons/DragDotsIcon";

import './settings-template-tree.scss';

const cls = new Bem('settings-template-tree');

const ITEM_TYPE = {
    SECTION: 'section',
    TEMPLATE: 'template'
};

export default function SettingsTemplatesTree({
    editPermissions,
    columnSettings,
    data,
    onEditItem,
    onClickItem = () => {},
    onDeleteItem,
    onSort,
    onAddItemChild
}) {
    return !!data.length && (
        <div {...cls()}>
            <div {...cls('header')}>
                {Object.keys(columnSettings).map(key => (
                    <div
                        {...cls('header-cell')}
                        key={key}
                        style={columnSettings[key].style}
                    >
                        {columnSettings[key].name}
                    </div>
                ))}
                <div {...cls('header-cell', 'buttons')}/>
            </div>

            <div {...cls('body')}>
                <List
                    items={data}
                    editPermissions={editPermissions}
                    columnSettings={columnSettings}
                    onSorting={onSort}
                    onEditItem={onEditItem}
                    onDeleteItem={onDeleteItem}
                    onClickItem={onClickItem}
                    onAddItemChild={onAddItemChild}
                />
            </div>
        </div>
    );
}

function List({
    opened = true,
    onSorting,
    parent,
    level,
    items,
    columnSettings,
    editPermissions,
    onAddItemChild,
    onEditItem,
    onDeleteItem,
    onClickItem
}) {
    const sortedItems = items.sort((a, b) => a.position - b.position);

    return (
        <Sortable
            {...cls('list', { opened })}
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
                <ListItem
                    parent={parent}
                    item={item}
                    key={itemIndex}
                    cls={cls}
                    columnSettings={columnSettings}
                    editPermissions={editPermissions}
                    onAddChild={onAddItemChild}
                    onEdit={onEditItem}
                    onDelete={onDeleteItem}
                    onClick={onClickItem}
                    onSortChildren={onSorting}
                />
            ))}
        </Sortable>
    );
}

function ListItem({
    parent,
    item,
    editPermissions,
    columnSettings,
    onAddChild,
    onEdit,
    onDelete,
    onSortChildren,
    onClick
}) {
    const [open, setOpen] = useState(false);

    const isSection = useMemo(() => item.hasOwnProperty('children'), [item, ITEM_TYPE]);

    const handleClick = useCallback(() => {
        item.open = !open;
        setOpen(!open);

        if (!isSection) {
            onClick(item);
        }
    }, [ open, item, isSection ]);

    const depth = useMemo(() => (parent?.depth + 1 || 0), [ parent ]);

    return (
        <li
            { ...cls('item') }
            data-id={item.id}
        >
            <div { ...cls('item-name') } style={{ paddingLeft: depth * 20 }}>
                <div
                    {...cls('item-name-wrap')}
                    onClick={handleClick}
                >
                    <div { ...cls('drag-handle') }>
                        <DragDotsIcon />
                    </div>

                    {isSection ? (
                        open
                            ? <FolderOpenIcon { ...cls('item-type-icon') } />
                            : <FolderIcon { ...cls('item-type-icon') } />
                    ) : (
                        <DocumentIcon { ...cls('item-type-icon') } />
                    )}

                    {Object
                        .keys(columnSettings)
                        .filter(key => !['id', 'link'].includes(key))
                        .map(key => {
                            const type = _.get(columnSettings[key], 'type', 'string');
                            const value = type === 'moment' && columnSettings[key].hasOwnProperty('format')
                                ? moment(item?.[key]).format(columnSettings[key].format)
                                : item?.[key] || '';

                            return (
                                <span
                                    key={key}
                                    {...cls('body-cell', key)}
                                    style={columnSettings[key] && columnSettings[key].style}
                                >
                                    {value}
                                </span>
                            );
                        })
                    }
                </div>


                <Access permissions={editPermissions}>
                    <div {...cls('item-buttons')}>
                        {isSection && (
                            <button
                                {...cls('item-button', 'plus')}
                                onClick={() => onAddChild(item)}
                                title='Добавить категорию'
                            >
                                <i {...cls('item-icon', 'plus')}>+</i>
                            </button>
                        )}
                        <button
                            {...cls('item-button', 'edit')}
                            onClick={() => onEdit(item)}
                            title='Редактировать'
                        >
                            <PencilIcon {...cls('item-icon', 'pencil')}/>
                        </button>
                        <button
                            {...cls('item-button', 'remove')}
                            onClick={() => onDelete(item, parent)}
                            title='Удалить'
                        >
                            <TrashIcon {...cls('item-icon', 'trash')}/>
                        </button>
                    </div>
                </Access>
            </div>

            {isSection && (
                <List
                    opened={open}
                    parent={item}
                    columnSettings={columnSettings}
                    items={[ ...item.children, ...item.export]}
                    onAddItemChild={onAddChild}
                    onEditItem={onEdit}
                    onDeleteItem={onDelete}
                    onSorting={onSortChildren}
                    onClickItem={onClick}
                />
            )}
        </li>
    );
}
