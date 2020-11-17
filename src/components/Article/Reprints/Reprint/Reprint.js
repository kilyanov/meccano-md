import React, { useState, useRef } from 'react';
import InputText from '../../../Form/InputText/InputText';
import InputDateTimePicker from '../../../Form/InputDateTimePicker/InputDatePicker';
import AsyncCreateableSelect from '../../../Form/AsyncCreatebleSelect/AsyncCreateableSelect';
import CheckBox from '../../../Form/CheckBox/CheckBox';
import DropDown from '../../../Shared/DropDown/DropDown';
import DropDownMenuIcon from '../../../Shared/SvgIcons/DropDownMenuIcon';
import PropTypes from 'prop-types';
import './reprint.scss';

const cls = new Bem('reprint');

function Reprint({ 
    index,
    id,
    title,
    url,
    source_id: sourceId,
    city_id: cityId,
    date,
    onFieldChange,
    onDeleteReprint,
    onSelectReprint,
    onCreateArticleFromReprint,
    loadedSources,
    loadedCities,
    SourceService,
    LocationService,
    isSelectable
}) {
    const [isShownAllFields, setShownAllFields] = useState(false);
    const [isSelectedReprint, setIsSelectedReprint] = useState(false);
    const dropDownMenuElement = useRef();

    const dropDownMenuItems = [
        {
            title: 'Создать статью',
            onClick: () => onCreateArticleFromReprint({ 
                title,
                url,
                sourceId,
                cityId,
                date,
                index
            })
        },
        {
            danger: true,
            title: 'Удалить',
            onClick: () => onDeleteReprint(index)
        }
    ];

    const handleShowAllFields = () => {
        setShownAllFields(!isShownAllFields);
    };

    const handleSelectReprint = (e) => {
        setIsSelectedReprint(!isSelectedReprint);
        onSelectReprint({ id, e });
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

    const handleFieldChangeOnSelect = ({ index: reprintIndex, name, select }) => {
        onFieldChange({ 
            index: reprintIndex,
            name, 
            value: select?.value || null 
        });
    };

    const handleEnter = () => {
        setShownAllFields(!isShownAllFields);
    };

    return (
        <div {...cls()}>
            {isSelectable &&
                <CheckBox
                    {...cls('select-reprint')}
                    checked={isSelectedReprint}
                    onChange={handleSelectReprint}
                />
            }
            <div {...cls('grid', {'is-selectable': isSelectable})}>
                <InputText
                    value={title || ''}
                    onChange={value => onFieldChange({ index, name: 'title', value })}
                    onEnter={handleEnter}
                    required
                    validateType="notEmpty"
                    {...cls('field', 'type-title')}
                />
                {dropDown}
                {isShownAllFields &&
                    <>
                        <InputText
                            value={url || ''}
                            onChange={value => onFieldChange({ index, name: 'url', value })}
                            validateType="link"
                            {...cls('field')}
                        />
                        <AsyncCreateableSelect
                            placeholder={'СМИ (Источник)'}
                            selected={sourceId}
                            onChange={(select) => handleFieldChangeOnSelect({ index, name: 'source_id', select })}
                            {...cls('field')}
                            requestService={SourceService.get}
                            loadedOptions={loadedSources || []}
                        />
                        <AsyncCreateableSelect
                            placeholder={'Город'}
                            selected={cityId}
                            onChange={(select) => handleFieldChangeOnSelect({ index, name: 'city_id', select })}
                            {...cls('field', 'half-size')}
                            requestService={LocationService.city.get}
                            loadedOptions={loadedCities || []}
                        />
                        <InputDateTimePicker
                            value={date || null}
                            onChange={value => onFieldChange({ index, name: 'date', value })}
                            readOnly={false}
                            required
                            {...cls('field', 'half-size')}
                        />   
                    </>
                }
                <button
                    {...cls('button-open', {'opened': isShownAllFields})}
                    onClick={handleShowAllFields}
                    type="button"
                    title="Показать все поля"
                />
            </div>
        </div>
    );
}

Reprint.propTypes = {
    index: PropTypes.number,
    id: PropTypes.string,
    title: PropTypes.string,
    url: PropTypes.string,
    source_id: PropTypes.any,
    city_id: PropTypes.any,
    date: PropTypes.instanceOf(Date),
    onFieldChange: PropTypes.func,
    onDeleteReprint: PropTypes.func,
    onSelectReprint: PropTypes.func,
    onCreateArticleFromReprint: PropTypes.func,
    loadedSources: PropTypes.array,
    loadedCities: PropTypes.array,
    SourceService: PropTypes.object,
    LocationService: PropTypes.object,
    isSelectable: PropTypes.bool
};

export default Reprint;
