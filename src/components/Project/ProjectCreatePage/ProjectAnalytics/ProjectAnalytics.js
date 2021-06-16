import React, { useEffect, useState } from 'react';
import AnalyticsObject from './AnalyticsObject/AnalyticsObject';
import Button from '../../../Shared/Button/Button';
import {
    objectService,
    toneService,
    speakerService,
    quoteLevelService,
    quoteTypeService
} from './mockServices';
import './project-analytics.scss';
import PlusIcon from '../../../Shared/SvgIcons/PlusIcon';

const cls = new Bem('project-analytics');

function ProjectAnalytics(props) {
    const {} = props;

    const [objects, setObjects] = useState([]);
    const [activeObjectId, setActiveObjectId] = useState('');
    const [activeObject, setActiveObject] = useState({});
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        objectService.get()
            .then(({ data }) => setObjects(data));
    }, []);

    useEffect(() => {
        const object = objects.find((obj) => obj.id === activeObjectId);
        if (object) {
            setActiveObject(object);
        } else {
            setActiveObject({});
        }
    }, [activeObjectId]);

    const handleAddObject = () => {
        setObjects([...objects, {
            id: null,
            name: 'Новый объект',
            objectSearchTone: null,
            objectTone: '',
            companySpeakers: []
        }]);
        setActiveObjectId(null);
    };

    const handleEditObject = () => {
        setIsEditMode(true);
    };

    const handleSaveObject = (object) => {
        // TODO: Сохранять на сервере
        const { id } = object;
        const objectIndex = objects.findIndex((o) => o.id === id);
        const updatedObjects = [... objects];
        updatedObjects[objectIndex] = object;
        setObjects(updatedObjects);
    };

    const handleResetObjects = () => {
        setIsEditMode(false);
    };

    const handleDeleteObject = (id) => {
        // TODO: Удалять на сервере
        const objectIndex = objects.findIndex((o) => o.id === id);
        const updatedObjects = [... objects];
        updatedObjects.splice(objectIndex, 1);
        setObjects(updatedObjects);
        setActiveObjectId('');
        setIsEditMode(false);
    };

    const isAllowedAddObject = objects.length === 0 || objects[objects.length - 1]?.id;

    return (
        <section {...cls()}>
            <div {...cls('objects')}>
                {!!objects.length && (
                    <ul {...cls('objects-list')}>
                        {objects.map((object, index) => (
                            <li {...cls('object-item')} key={index}>
                                <Button
                                    {...cls('object-button', 'active')}
                                    title={object.name}
                                    onClick={() => setActiveObjectId(object.id)}
                                    style={ object.id === activeObjectId ? 'success' : 'default' }
                                    disabled={isEditMode}
                                >
                                    {object.name}
                                </Button>
                            </li>
                        ))}
                    </ul>
                )}
                <Button
                    {...cls('add-object-button')}
                    style="success"
                    title="Добавить объект"
                    onClick={handleAddObject}
                    disabled={!isAllowedAddObject || isEditMode}
                >
                    <PlusIcon />
                </Button>
            </div>
            <AnalyticsObject
                {...cls('object-settings')}
                toneService={ toneService }
                speakerService={speakerService}
                quoteLevelService={quoteLevelService}
                quoteTypeService={quoteTypeService}
                object={ activeObject }
                objects={ objects }
                onEdit={handleEditObject}
                onSaveObject={handleSaveObject}
                onResetObject={handleResetObjects}
                onDeleteObject={handleDeleteObject}
            />
        </section>
    );
}

export default ProjectAnalytics;
