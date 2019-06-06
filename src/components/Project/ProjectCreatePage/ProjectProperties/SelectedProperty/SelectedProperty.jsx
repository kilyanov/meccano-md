import React from 'react';
import './selected-property.scss';
import ArrowIcon from '../../../../Shared/SvgIcons/ArrowIcon';
import TrashIcon from '../../../../Shared/SvgIcons/TrashIcon';

const classes = new Bem('selected-property');

const SelectedProperty = ({item, index, type, onDelete = () => {}}) => (
    <div {...classes()} data-id={item.code}>
        <div {...classes('arrows')}>
            <ArrowIcon {...classes('arrow-top')}/>
            <ArrowIcon {...classes('arrow-bottom')}/>
        </div>

        {item.name}

        {type === 'fields' && (
            <button
                {...classes('remove-button')}
                onClick={() => onDelete(index)}
            >
                <TrashIcon {...classes('trash-icon')}/>
            </button>
        )}
    </div>
);

export default SelectedProperty;
