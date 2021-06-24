import React, { useEffect, useRef, useState } from 'react';
import Sortable from 'react-sortablejs';
import './sortable-virtual-list.scss';

const cls = new Bem('sortable-virtual-list');

function SortableVirtualList(props) {
    const {
        className: mix = '',
        items = [],
        Item = () => {},
        page = 1,
        pageCount = 1,
        onSort,
        onFetchMoreItems
    } = props;

    const [isEndScroll, setIsEndScroll] = useState(false);
    const listRef = useRef(null);

    useEffect(() => {
        if (isEndScroll) {
            handleEndReached();
        }
    }, [isEndScroll]);

    const handleSort = (sortedKeys, sortable, evt) => {
        const sortedItems = sortedKeys.map(key => {
            return items.find((item) => item.id === key);
        });
        onSort(sortedItems, sortable, evt);
    };

    const handleEndReached = () => {
        if (page < pageCount) {
            onFetchMoreItems(true, page);
        }
    };

    const handleEndScroll = () => {
        const { scrollHeight, scrollTop, clientHeight } = listRef.current.node;
        const endScrollState = scrollHeight - scrollTop - 64 * 3 <= clientHeight;
        if (isEndScroll !== endScrollState) {
            setIsEndScroll(endScrollState);
        }
    };

    return (
        <Sortable
            {...cls('', '', mix)}
            options={{ animation: 150 }}
            ref={listRef}
            onChange={handleSort}
            onScroll={handleEndScroll}
        >
            {items.map((item, index) => (
                <div
                    data-id={item.id}
                    key={item.id}
                >
                    <Item item={item} index={index} />
                </div>
            ))}
        </Sortable>
    );
}

export default SortableVirtualList;
