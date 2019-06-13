import React from 'react';
import './properties-table-item.scss';
import TrashIcon from '../../SvgIcons/TrashIcon';
import PencilIcon from '../../SvgIcons/PencilIcon';

const classes = new Bem('properties-table-item');
const PropertiesTableRow = ({item, columnSettings, onEdit, onDelete, onClick}) => (
    <div {...classes()} onClick={(e) => {
        if (!e.target.classList.contains(classes('button').className)) {
            onClick(item);
        }
    }}
    >
        <div {...classes('cells')}>
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
                            {...classes('body-cell', key)}
                            style={columnSettings[key] && columnSettings[key].style}
                        >
                            {value}
                        </span>
                    );
                })
            }
        </div>

        <div {...classes('buttons')}>
            <button
                {...classes('button')}
                onClick={() => onEdit(item)}
            >
                <PencilIcon {...classes('icon')}/>
            </button>
            <button
                {...classes('button')}
                onClick={() => onDelete(item)}
            >
                <TrashIcon {...classes('icon')}/>
            </button>
        </div>
    </div>
);

export default PropertiesTableRow;
