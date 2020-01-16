import React from 'react';
import './selected-property.scss';
import ArrowIcon from '../../../../Shared/SvgIcons/ArrowIcon';
import TrashIcon from '../../../../Shared/SvgIcons/TrashIcon';
import CheckBox from '../../../../Form/CheckBox/CheckBox';

const cls = new Bem('selected-property');

const SelectedProperty = ({
    item,
    index,
    onChange = () => {},
    onDelete = () => {}
}) => (
    <div {...cls('', {required: item.required})} data-id={item.slug}>
        <div {...cls('arrows')}>
            <ArrowIcon {...cls('arrow-top')}/>
            <ArrowIcon {...cls('arrow-bottom')}/>
        </div>

        <span {...cls('name')}>{item.name}</span>

        <CheckBox
            {...cls('checkbox')}
            label='Обязательное поле'
            checked={item.required}
            onChange={() => {
                item.required = !item.required;
                onChange(item);
            }}
        />

        <div {...cls('buttons')}>
            <button
                {...cls('remove-button')}
                onClick={() => onDelete(index)}
            >
                <TrashIcon {...cls('trash-icon')}/>
            </button>
        </div>
    </div>
);

export default SelectedProperty;
