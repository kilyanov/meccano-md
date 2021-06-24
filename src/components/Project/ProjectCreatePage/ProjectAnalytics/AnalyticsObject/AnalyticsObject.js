import React, { useEffect, useState } from 'react';
import InputText from '../../../../Form/InputText/InputText';
import Button from '../../../../Shared/Button/Button';
import CompanySpeaker from './CompanySpeaker/CompanySpeaker';
import OutsideSpeaker from './OutsideSpeaker/OutsideSpeaker';
import './analytics-object.scss';


const cls = new Bem('analytics-object');

function AnalyticsObject(props) {
    const {
        className: mix = '',
        object,
        objects,
        speakerService,
        quoteLevelService,
        quoteTypeService,
        categoryService,
        onEditObject,
        onSaveObject,
        onResetObject,
        onDeleteObject
    } = props;

    const [objectName, setObjectName] = useState('');
    const [companySpeakers, setCompanySpeakers] = useState([]);
    const [outsideSpeakers, setOutsideSpeakers] = useState([]);

    const resetObject = () => {
        if (object?.id) {
            setObjectName(object.name);
            setCompanySpeakers(_.cloneDeep(object.companySpeakers));
            setOutsideSpeakers(_.cloneDeep(object.outsideSpeakers));
        } else {
            setObjectName('');
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
        setCompanySpeakers([...companySpeakers, null]);
        onEditObject();
    };

    const handleChangeCompanySpeakers = (evt, index) => {
        const updatedCompanySpeakers = [...companySpeakers];
        if (evt === null) {
            updatedCompanySpeakers.splice(index, 1);
        } else {
            updatedCompanySpeakers[index] = evt.value;
        }
        setCompanySpeakers(updatedCompanySpeakers);
        onEditObject();
    };

    const handleAddOutsideSpeaker = () => {
        setOutsideSpeakers([...outsideSpeakers, null]);
        onEditObject();
    };

    const handleChangeOutsideSpeakers = (evt, index) => {
        const updatedOutsideSpeakers = [...outsideSpeakers];
        if (evt === null) {
            updatedOutsideSpeakers.splice(index, 1);
        } else {
            updatedOutsideSpeakers[index] = evt.value;
        }
        setOutsideSpeakers(updatedOutsideSpeakers);
        onEditObject();
    };

    const handleSaveObject = () => {
        onSaveObject({
            id: object?.id,
            name: objectName,
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

    const isAllowedAddCompanySpeakers = companySpeakers.length === 0 || !!companySpeakers[companySpeakers.length - 1];
    const isAllowedAddOutsideSpeakers = outsideSpeakers.length === 0 || !!outsideSpeakers[outsideSpeakers.length - 1];

    return (
        <section {...cls('', '', mix)}>
            <div {...cls('header')}>
                <h3 {...cls('header-title')}>Настройка объекта {object.name}</h3>
                <div {...cls('header-buttons')}>
                    <Button {...cls('save-button')} style="success" onClick={handleSaveObject}>Сохранить</Button>
                    <Button {...cls('reset-button')} style="info" onClick={handleResetObject}>Сбросить</Button>
                    <Button {...cls('delete-button')} style="error" onClick={handleDeleteObject}>Удалить</Button>
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
            </div>
            <div {...cls('speakers')}>
                <span {...cls('speakers-label')}>Спикеры компании</span>
                <ul {...cls('speakers-list')}>
                    {companySpeakers.map((companySpeaker, index) => (
                        <li key={companySpeaker || index} {...cls('speakers-item')}>
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
                    {...cls('add-speaker-button')}
                    style="inline"
                    onClick={handleAddCompanySpeaker}
                    disabled={!isAllowedAddCompanySpeakers}
                >
                    + Добавить спикера
                </Button>
            </div>
            <div {...cls('speakers')}>
                <span {...cls('speakers-label')}>Сторонние спикеры</span>
                <ul {...cls('speakers-list')}>
                    {outsideSpeakers.map((outsideSpeaker, index) => (
                        <li key={outsideSpeaker || index} {...cls('speakers-item')}>
                            <OutsideSpeaker
                                outsideSpeaker={outsideSpeaker}
                                outsideSpeakers={outsideSpeakers}
                                outsideSpeakersIndex={index}
                                speakerService={speakerService}
                                categoryService={categoryService}
                                onChangeOutsideSpeaker={handleChangeOutsideSpeakers}
                            />
                        </li>
                    ))}
                </ul>
                <Button
                    {...cls('add-speaker-button')}
                    style="inline"
                    onClick={handleAddOutsideSpeaker}
                    disabled={!isAllowedAddOutsideSpeakers}
                >
                    + Добавить спикера
                </Button>
            </div>
        </section>
    );
}

export default AnalyticsObject;
