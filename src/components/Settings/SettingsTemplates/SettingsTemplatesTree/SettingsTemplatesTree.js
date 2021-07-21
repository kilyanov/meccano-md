import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Sortable from "react-sortablejs";
import PencilIcon from "../../../Shared/SvgIcons/PencilIcon";
import TrashIcon from "../../../Shared/SvgIcons/TrashIcon";
import Access from "../../../Shared/Access/Access";
import FolderIcon from "../../../Shared/SvgIcons/FolderIcon";
import FolderOpenIcon from "../../../Shared/SvgIcons/FolderOpenIcon";
import DocumentIcon from "../../../Shared/SvgIcons/DocumentIcon";
import DragDotsIcon from "../../../Shared/SvgIcons/DragDotsIcon";
import PlusIcon from "../../../Shared/SvgIcons/PlusIcon";
import CopuIcon from "../../../Shared/SvgIcons/CopyIcon";
import './settings-template-tree.scss';

const cls = new Bem('settings-template-tree');

export default function SettingsTemplatesTree({
    editPermissions,
    columnSettings,
    data,
    onEditItem,
    onCopyItem,
    onClickItem = () => {},
    onDeleteItem,
    onSort,
    onAddItemChild
}) {
    if (data) {
        const items = getItems(data);

        return (
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
                        items={items}
                        editPermissions={editPermissions}
                        columnSettings={columnSettings}
                        onSorting={onSort}
                        onEditItem={onEditItem}
                        onCopyItem={onCopyItem}
                        onDeleteItem={onDeleteItem}
                        onClickItem={onClickItem}
                        onAddItemChild={onAddItemChild}
                    />
                </div>
            </div>
        );
    }

    return null;
}

function List({
    opened = true,
    onSorting,
    parent,
    items,
    columnSettings,
    editPermissions,
    onAddItemChild,
    onEditItem,
    onCopyItem,
    onDeleteItem,
    onClickItem
}) {
    const sortedItems = items.sort((a, b) => a.position - b.position);

    return (
        <Sortable
            {...cls('list', { opened })}
            tag='ul'
            onChange={sorted => onSorting(sorted, parent)}
            options={{
                group: 'nested',
                animation: 150,
                filter: '.ps__rail-y',
                handle: '.drag-handle',
                fallbackOnBody: true,
                swapThreshold: 0.65
            }}
        >
            {sortedItems.map((item, itemIndex) => (
                <ListItem
                    parent={parent}
                    open={!item.hasOwnProperty('open') ? false : item.open}
                    item={item}
                    key={itemIndex}
                    cls={cls}
                    columnSettings={columnSettings}
                    editPermissions={editPermissions}
                    onAddChild={onAddItemChild}
                    onEdit={onEditItem}
                    onCopy={onCopyItem}
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
    onCopy,
    onEdit,
    onDelete,
    onSortChildren,
    onClick
}) {
    const [open, setOpen] = useState(!!item.open);
    const isSection = useMemo(() => {
        return item.hasOwnProperty('children')
            || item.hasOwnProperty('import')
            || item.hasOwnProperty('export');
    }, [item]);
    const items = getItems(item);

    const handleClick = useCallback(() => {
        item.open = !open;
        setOpen(!open);

        if (!isSection) {
            onClick(item);
        }
    }, [ open, item, isSection ]);

    const depth = useMemo(() => (parent?.depth + 1 || 0), [ parent ]);

    useEffect(() => {
        if (item.hasOwnProperty('open') && item.open !== open) {
            setOpen(item.open);
        }
    }, [item.open]);

    return (
        <li
            { ...cls('item') }
            data-id={JSON.stringify(item)} // item.id || item.name}
        >
            <div
                { ...cls('item-name') }
                style={{ paddingLeft: depth * 20 }}
            >
                <div
                    {...cls('item-name-wrap')}
                    onClick={handleClick}
                >
                    <div { ...cls('drag-handle', '', 'drag-handle') }>
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
                        .map((key, i) => {
                            const column = columnSettings[key];
                            const type = _.get(column, 'type', 'string');
                            const value = type === 'moment' && column.hasOwnProperty('format')
                                ? moment(item?.[key]).format(column.format)
                                : item?.[key] || '';
                            let style = column?.style || {};

                            if (i === 1 && depth) {
                                style = { ...style, marginLeft: -(depth * 20) };
                            }

                            return (
                                <span
                                    key={key}
                                    {...cls('body-cell', key)}
                                    style={style}
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
                                title='Добавить категорию или шаблон'
                            >
                                <PlusIcon />
                            </button>
                        )}
                        {!isSection && (
                            <button
                                {...cls('item-button', 'edit')}
                                onClick={() => onCopy(item, parent)}
                                title='Копировать'
                            >
                                <CopuIcon {...cls('item-icon', 'copy')}/>
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
                    items={items}
                    onAddItemChild={onAddChild}
                    onEditItem={onEdit}
                    onCopyItem={onCopy}
                    onDeleteItem={onDelete}
                    onSorting={onSortChildren}
                    onClickItem={onClick}
                />
            )}
        </li>
    );
}


function getItems(data) {
    if (!data) {
        return [];
    }

    let items = data.children || [];

    if (data.export?.length) {
        items = [ ...items, ...data.export ];
    }

    if (data.import?.length) {
        items = [ ...items, ...data.import ];
    }

    return items;
}
