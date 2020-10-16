import React, { useState, useRef } from 'react';
import InputText from '../../Form/InputText/InputText';
import InputDateTimePicker from '../../Form/InputDateTimePicker/InputDatePicker';
import Select from '../../Form/Select/Select';
import DropDown from '../../Shared/DropDown/DropDown';
import DropDownMenuIcon from '../../Shared/SvgIcons/DropDownMenuIcon';
import PropTypes from 'prop-types';
import './reprint.scss';

const cls = new Bem('reprint');

function Reprint({ id, title, url, source_id: sourceId, city_id: cityId, date, onFieldChange }) {
    const [isShownAllFields, setShownAllFields] = useState(false);
    const dropDownMenuElement = useRef();

    const dropDownMenuItems = [
        {
            title: 'Создать новую',
            onClick: () => console.log(`Создать ${id}`)
        },
        {
            title: 'Перенести',
            onClick: () => console.log(`Перенести ${id}`)
        },
        {
            danger: true,
            title: 'Удалить',
            onClick: () => console.log(`Удалить ${id}`)
        }
    ];

    const handleShowAllFields = () => {
        setShownAllFields(!isShownAllFields);
    };

    const dropDown = (
        <button
            {...cls('menu-button')}
            onClick={() => {
                dropDownMenuElement.current.toggle({ style: { right: '0' } });
            }}
        >
            <DropDownMenuIcon {...cls('menu-button-icon')}/>
            <DropDown
                items={dropDownMenuItems}
                ref={dropDownMenuElement}
            />
        </button>
    );

    return (
        <div {...cls()}>
            <div {...cls('grid')}>
                <InputText
                    value={title || ''}
                    onChange={value => onFieldChange({ id, name: 'title', value })}
                    required
                    {...cls('field')}
                />
                {dropDown}
                {isShownAllFields &&
                    <>
                        <InputText
                            value={url || ''}
                            onChange={value => onFieldChange({ id, name: 'url', value })}
                            validateType="link"
                            required
                            {...cls('field')}
                        />
                        <Select
                            placeholder={'СМИ (Источник)'}
                            options={null || []}
                            selected={sourceId}
                            onChange={value => onFieldChange({ id, name: 'source_id', value })}
                            {...cls('field')}
                        />
                        <Select
                            placeholder={'Город'}
                            options={null || []}
                            selected={cityId}
                            onChange={value => onFieldChange({ id, name: 'city_id', value })}
                            {...cls('field', 'half-size')}
                        />
                        <InputDateTimePicker
                            value={new Date(date) || null}
                            onChange={value => onFieldChange({ id, name: 'date', value })}
                            readOnly={false}
                            required
                            {...cls('field', 'half-size')}
                        />   
                    </>
                }
            </div>
            <button
                {...cls('button-open', {'opened': isShownAllFields})}
                onClick={handleShowAllFields}
                type="button"
                title="Показать все поля"
            />
        </div>
    );
}

Reprint.propTypes = {
    id: PropTypes.string,
    title: PropTypes.string,
    url: PropTypes.string,
    source_id: PropTypes.string,
    city_id: PropTypes.string,
    date: PropTypes.string,
    onFieldChange: PropTypes.func
};

export default Reprint;
