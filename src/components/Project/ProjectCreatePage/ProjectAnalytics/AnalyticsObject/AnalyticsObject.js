import React, { useEffect, useState } from 'react';
import InputText from '../../../../Form/InputText/InputText';
import Button from '../../../../Shared/Button/Button';
import AsyncCreateableSelect from '../../../../Form/AsyncCreatebleSelect/AsyncCreateableSelect';
import CompanySpeaker from './CompanySpeaker/CompanySpeaker';
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
        onEdit,
        onSaveObject,
        onResetObject,
        onDeleteObject
    } = props;

    const [objectName, setObjectName] = useState('');
    const [objectSearchQuery, setObjectSearchQuery] = useState('');
    const [objectTone, setObjectTone] = useState(null);
    const [companySpeakers, setCompanySpeakers] = useState([]);

    const resetObject = () => {
        if (object?.id) {
            setObjectName(object.name);
            setObjectSearchQuery(object.objectSearchQuery);
            setObjectTone(object.objectTone);
            setCompanySpeakers(_.cloneDeep(object.companySpeakers));
        } else {
            setObjectName('');
            setObjectSearchQuery('');
            setObjectTone(null);
            setCompanySpeakers([]);
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

    const handleAddCompanySpeaker = () => {
        setCompanySpeakers([...companySpeakers, {}]);
        onEdit();
    };

    const handleChangeCompanySpeakers = (evt, index) => {
        const updatedCompanySpeakers = [...companySpeakers];
        if (evt === null) {
            updatedCompanySpeakers.splice(index, 1);
        } else {
            updatedCompanySpeakers[index].speaker = evt.value;
        }
        setCompanySpeakers(updatedCompanySpeakers);
        onEdit();
    };

    const handleSaveObject = () => {
        onSaveObject({
            id: object?.id,
            name: objectName,
            objectSearchQuery,
            objectTone,
            companySpeakers
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
                    onChange={(value) => setObjectName(value)}
                />
                <InputText
                    {...cls('input')}
                    label="Поисковый запрос объекта"
                    placeholder="Введите поисковый запрос объекта"
                    value={objectSearchQuery}
                    validateType="notEmpty"
                    onChange={(value) => setObjectSearchQuery(value)}
                />
                <AsyncCreateableSelect
                    {...cls('select')}
                    label="Тональность объекта"
                    placeholder="Выберете тональность объекта"
                    selected={objectTone}
                    editable
                    required
                    requestService={toneService.get}
                    onChange={(evt) => setObjectTone(evt?.value || null)}
                    onCreateOption={() => {}}
                />
            </div>
            <div {...cls('company-speakers')}>
                <div {...cls('company-speakers-labels')}>
                    <span {...cls('company-speakers-label')}>Спикеры компании</span>
                    <span {...cls('company-speakers-label')}>Представитель</span>
                    <span {...cls('company-speakers-label')}>Уровень</span>
                    <span {...cls('company-speakers-label')}>Тип цитат</span>
                </div>
                <ul {...cls('company-speakers-list')}>
                    {companySpeakers.map((companySpeaker, index) => (
                        <li key={companySpeaker.speaker || index} {...cls('company-speakers-item')}>
                            <CompanySpeaker
                                companySpeaker={companySpeaker}
                                companySpeakers={companySpeakers}
                                companySpeakersIndex={index}
                                speakerService={speakerService}
                                quoteLevelService={quoteLevelService}
                                quoteTypeService={quoteTypeService}
                                objects={objects}
                                onChangeCompanySpeaker={handleChangeCompanySpeakers}
                            />
                        </li>
                    ))}
                </ul>
                <Button
                    {...cls('add-company-speaker-button')}
                    style="success"
                    title="Добавить спикера"
                    onClick={handleAddCompanySpeaker}
                    disabled={!isAllowedAddCompanySpeakers}
                >
                    <PlusIcon />
                </Button>
            </div>
        </section>
    );
}

export default AnalyticsObject;
