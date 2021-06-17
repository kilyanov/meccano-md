import React, { useEffect, useState } from 'react';
import InputText from '../../../../Form/InputText/InputText';
import Button from '../../../../Shared/Button/Button';
import AsyncCreateableSelect from '../../../../Form/AsyncCreatebleSelect/AsyncCreateableSelect';
import CompanySpeaker from './CompanySpeaker/CompanySpeaker';
import OutsideSpeaker from './OutsideSpeaker/OutsideSpeaker';
import PlusIcon from '../../../../Shared/SvgIcons/PlusIcon';
import './analytics-object.scss';

const cls = new Bem('analytics-object');

function AnalyticsObject(props) {
    const {
        className: mix = '',
        object,
        objects,
        toneService,
        speakerService,
        quoteLevelService,
        quoteTypeService,
        quoteCategoryService,
        onEditObject,
        onSaveObject,
        onResetObject,
        onDeleteObject
    } = props;

    const [objectName, setObjectName] = useState('');
    const [objectSearchQuery, setObjectSearchQuery] = useState('');
    const [objectTone, setObjectTone] = useState(null);
    const [companySpeakers, setCompanySpeakers] = useState([]);
    const [outsideSpeakers, setOutsideSpeakers] = useState([]);

    const resetObject = () => {
        if (object?.id) {
            setObjectName(object.name);
            setObjectSearchQuery(object.objectSearchQuery);
            setObjectTone(object.objectTone);
            setCompanySpeakers(_.cloneDeep(object.companySpeakers));
            setOutsideSpeakers(_.cloneDeep(object.outsideSpeakers));
        } else {
            setObjectName('');
            setObjectSearchQuery('');
            setObjectTone(null);
            setCompanySpeakers([]);
            setOutsideSpeakers([]);
        }
    };

    useEffect(resetObject, [object]);

    if (!object?.name) {
        return (
            <section {...cls('', '', mix)}>
                Выберете объект или создайте новый
            </section>
        );
    }

    const handleEditObject = (value, setter) => {
        setter(value);
        onEditObject();
    };

    const handleAddCompanySpeaker = () => {
        setCompanySpeakers([...companySpeakers, {}]);
        onEditObject();
    };

    const handleChangeCompanySpeakers = (evt, index) => {
        const updatedCompanySpeakers = [...companySpeakers];
        if (evt === null) {
            updatedCompanySpeakers.splice(index, 1);
        } else {
            updatedCompanySpeakers[index].speaker = evt.value;
        }
        setCompanySpeakers(updatedCompanySpeakers);
        onEditObject();
    };

    const handleAddOutsideSpeaker = () => {
        setOutsideSpeakers([...outsideSpeakers, {}]);
        onEditObject();
    };

    const handleChangeOutsideSpeakers = (evt, index) => {
        const updatedOutsideSpeakers = [...outsideSpeakers];
        if (evt === null) {
            updatedOutsideSpeakers.splice(index, 1);
        } else {
            updatedOutsideSpeakers[index].speaker = evt.value;
        }
        setOutsideSpeakers(updatedOutsideSpeakers);
        onEditObject();
    };

    const handleSaveObject = () => {
        onSaveObject({
            id: object?.id,
            name: objectName,
            objectSearchQuery,
            objectTone,
            companySpeakers,
            outsideSpeakers
        });
    };

    const handleResetObject = () => {
        resetObject();
        if (onResetObject) {
            onResetObject();
        }
    };

    const handleDeleteObject = () => {
        onDeleteObject(object?.id);
    };

    const isAllowedAddCompanySpeakers = companySpeakers.length === 0 || !!companySpeakers[companySpeakers.length - 1]?.speaker;
    const isAllowedAddOutsideSpeakers = outsideSpeakers.length === 0 || !!outsideSpeakers[outsideSpeakers.length - 1]?.speaker;

    return (
        <section {...cls('', '', mix)}>
            <div {...cls('header')}>
                <h3 {...cls('header-title')}>Настройка объекта {object.name}</h3>
                <div {...cls('header-buttons')}>
                    <Button {...cls('save-button')} style="success" onClick={handleSaveObject}>Сохранить</Button>
                    <Button {...cls('save-button')} style="info" onClick={handleResetObject}>Сбросить</Button>
                    <Button {...cls('save-button')} style="error" onClick={handleDeleteObject}>Удалить</Button>
                </div>
            </div>
            <div {...cls('general')}>
                <InputText
                    {...cls('input')}
                    label="Имя объекта"
                    placeholder="Введите имя объекта"
                    value={objectName}
                    validateType="notEmpty"
                    required
                    onChange={(value) => handleEditObject(value, setObjectName)}
                />
                <InputText
                    {...cls('input')}
                    label="Поисковый запрос объекта"
                    placeholder="Введите поисковый запрос объекта"
                    value={objectSearchQuery}
                    validateType="notEmpty"
                    onChange={(value) => handleEditObject(value, setObjectSearchQuery)}
                />
                <AsyncCreateableSelect
                    {...cls('select')}
                    label="Тональность объекта"
                    placeholder="Выберете тональность объекта"
                    selected={objectTone}
                    required
                    requestService={toneService.get}
                    onChange={(evt) => handleEditObject(evt?.value || null, setObjectTone)}
                    onCreateOption={() => {}}
                />
            </div>
            <div {...cls('speakers')}>
                <div {...cls('speakers-labels')}>
                    <span {...cls('speakers-label')}>Спикеры компании</span>
                    {companySpeakers.length !== 0 && (
                        <>
                            <span {...cls('speakers-label')}>Представитель</span>
                            <span {...cls('speakers-label')}>Уровень</span>
                            <span {...cls('speakers-label')}>Тип цитат</span>
                        </>
                    )}
                </div>
                <ul {...cls('speakers-list')}>
                    {companySpeakers.map((companySpeaker, index) => (
                        <li key={companySpeaker.speaker || index} {...cls('speakers-item')}>
                            <CompanySpeaker
                                companySpeaker={companySpeaker}
                                companySpeakers={companySpeakers}
                                companySpeakersIndex={index}
                                speakerService={speakerService}
                                quoteLevelService={quoteLevelService}
                                quoteTypeService={quoteTypeService}
                                objects={objects}
                                // TODO: Разобраться, поля спикера принадлежат спикеру или объекту
                                onEditCompanySpeaker={onEditObject}
                                onChangeCompanySpeaker={handleChangeCompanySpeakers}
                            />
                        </li>
                    ))}
                </ul>
                <Button
                    {...cls('add-speaker-button')}
                    style="success"
                    title="Добавить спикера"
                    onClick={handleAddCompanySpeaker}
                    disabled={!isAllowedAddCompanySpeakers}
                >
                    <PlusIcon />
                </Button>
            </div>
            <div {...cls('speakers')}>
                <div {...cls('speakers-labels')}>
                    <span {...cls('speakers-label')}>Сторонние спикеры</span>
                    {outsideSpeakers.length !== 0 && (
                        <>
                            <span {...cls('speakers-label')}>Категория</span>
                        </>
                    )}
                </div>
                <ul {...cls('speakers-list')}>
                    {outsideSpeakers.map((outsideSpeaker, index) => (
                        <li key={outsideSpeaker.speaker || index} {...cls('speakers-item')}>
                            <OutsideSpeaker
                                outsideSpeaker={outsideSpeaker}
                                outsideSpeakers={outsideSpeakers}
                                outsideSpeakersIndex={index}
                                speakerService={speakerService}
                                quoteCategoryService={quoteCategoryService}
                                // TODO: Разобраться, поля спикера принадлежат спикеру или объекту
                                onEditOutsideSpeaker={onEditObject}
                                onChangeOutsideSpeaker={handleChangeOutsideSpeakers}
                            />
                        </li>
                    ))}
                </ul>
                <Button
                    {...cls('add-speaker-button')}
                    style="success"
                    title="Добавить спикера"
                    onClick={handleAddOutsideSpeaker}
                    disabled={!isAllowedAddOutsideSpeakers}
                >
                    <PlusIcon />
                </Button>
            </div>
        </section>
    );
}

export default AnalyticsObject;
