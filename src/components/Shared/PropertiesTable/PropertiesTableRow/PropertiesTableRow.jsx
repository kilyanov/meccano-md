import React from 'react';
import './properties-table-item.scss';
import TrashIcon from '../../SvgIcons/TrashIcon';
import PencilIcon from '../../SvgIcons/PencilIcon';

const cls = new Bem('properties-table-item');
const PropertiesTableRow = ({item, columnSettings, onEdit, onDelete, onClick}) => (
    <div {...cls()} onClick={(e) => {
        if (!e.target.classList.contains(classes('button').className)) {
            onClick(item);
        }
    }}
    >
        <div {...cls('cells')}>
            {Object
                .keys(columnSettings)
                .filter(key => !['id', 'link'].includes(key))
                .map(key => {
                    const type = _.get(columnSettings[key], 'type', 'string');
                    const value = type === 'moment' && columnSettings[key].hasOwnProperty('format') ?
                        moment(item[key]).format(columnSettings[key].format) : item[key];

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

        <div {...cls('buttons')}>
            <button
                {...cls('button')}
                onClick={() => onEdit(item)}
            >
                <PencilIcon {...cls('icon')}/>
            </button>
            <button
                {...cls('button')}
                onClick={() => onDelete(item)}
            >
                <TrashIcon {...cls('icon')}/>
            </button>
        </div>
    </div>
);

export default PropertiesTableRow;
