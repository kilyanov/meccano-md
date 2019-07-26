import React from 'react';
import './selected-property.scss';
import ArrowIcon from '../../../../Shared/SvgIcons/ArrowIcon';
import TrashIcon from '../../../../Shared/SvgIcons/TrashIcon';
import CheckBox from '../../../../Form/CheckBox/CheckBox';

const classes = new Bem('selected-property');

const SelectedProperty = ({
    item,
    index,
    onChange = () => {},
    onDelete = () => {}
}) => (
    <div {...classes('', {required: item.required})} data-id={item.code}>
        <div {...classes('arrows')}>
            <ArrowIcon {...classes('arrow-top')}/>
            <ArrowIcon {...classes('arrow-bottom')}/>
        </div>

        <span {...classes('name')}>{item.name}</span>

        <CheckBox
            {...classes('checkbox')}
            label='Обязательное поле'
            checked={item.required}
            onChange={() => {
                item.required = !item.required;
                onChange(item);
            }}
        />

        <div {...classes('buttons')}>
            <button
                {...classes('remove-button')}
                onClick={() => onDelete(index)}
            >
                <TrashIcon {...classes('trash-icon')}/>
            </button>
        </div>
    </div>
);

export default SelectedProperty;
