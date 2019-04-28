import React from 'react';
import { SORT_DIR } from '../../../../../constants/SortDirection';

const SortArrow = ({classes, dir}) => (
    dir ? <div {...classes('sort-arrow')}>
        {dir === SORT_DIR.DESC ? <i>&darr;</i> : <i>&uarr;</i>}
    </div> : null
);

export default SortArrow;
