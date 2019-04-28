import React from 'react';
import SortArrow from './ProjectTableHeaderSortArrow';
import { COLUMN_TYPE } from '../Columns';

const Cell = ({classes, type, sort, onChangeSort, content}) => {
    const active = sort.type === COLUMN_TYPE[type];

    return (
        <div
            {...classes('cell', {[type]: true, active})}
            onClick={() => onChangeSort(COLUMN_TYPE[type])}
        >
            {content}
            {active && <SortArrow classes={classes} dir={sort.dir}/>}
        </div>
    );
};

export default Cell;
