import React from 'react';
import SortArrow from './ProjectTableHeaderSortArrow';

const Cell = ({classes, type, sort, onChangeSort, content}) => {
    const active = sort.type === type;

    return (
        <div
            {...classes('cell', {[type]: true, active})}
            onClick={() => onChangeSort(type)}
        >
            {content}
            {active && <SortArrow classes={classes} dir={sort.dir}/>}
        </div>
    );
};

export default Cell;
