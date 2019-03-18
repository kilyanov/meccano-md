import React from 'react';
import CheckBox from '../../../../Form/CheckBox/CheckBox';
import './project-table-header.scss';
import {COLUMN_TYPE, COLUMN_NAME} from '../Columns';
import {SORT_DIR} from '../../../../../constants';

const classes = new Bem('project-table-header');
const SortArrow = ({dir}) => (
    dir ? <div {...classes('sort-arrow')}>
        {dir === SORT_DIR.DESC ? <i>&darr;</i> : <i>&uarr;</i>}
    </div> : null
);
const Cell = ({type, sort, onChangeSort, content}) => {
    const active = sort.type === COLUMN_TYPE[type];

    return (
        <div
            {...classes('cell', {[type]: true, active})}
            onClick={() => onChangeSort(COLUMN_TYPE[type])}
        >
            {content}
            {active && <SortArrow dir={sort.dir}/>}
        </div>
    );
};
const ProjectTableHeader = ({
    sort,
    onChangeSort,
    onSelectAll,
    isAllSelected
}) => (
    <section {...classes()}>
        <div {...classes('cell', 'check')}>
            <CheckBox
                {...classes('checkbox')}
                onChange={checked => onSelectAll(checked)}
                checked={isAllSelected}
            />
        </div>

        {Object
            .keys(COLUMN_TYPE)
            .filter(key => key !== COLUMN_TYPE.check)
            .map(key => (
                <Cell
                    key={key}
                    type={key}
                    sort={sort}
                    onChangeSort={onChangeSort}
                    content={COLUMN_NAME[key]}
                />
            ))}
    </section>
);

export default ProjectTableHeader;
