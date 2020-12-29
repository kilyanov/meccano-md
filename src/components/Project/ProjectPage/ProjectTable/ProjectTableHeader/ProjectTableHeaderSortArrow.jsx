import React from 'react';
import { SORT_DIR } from '@const';

const SortArrow = ({ classes, dir }) => (
    dir ? <div {...classes('sort-arrow')}>
        {dir === SORT_DIR.ASC ? <i>&darr;</i> : <i>&uarr;</i>}
    </div> : null
);

export default SortArrow;
