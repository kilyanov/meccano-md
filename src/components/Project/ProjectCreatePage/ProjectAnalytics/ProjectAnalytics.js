import React, { useEffect, useState } from 'react';
import AnalyticsObject from './AnalyticsObject/AnalyticsObject';
import './project-analytics.scss';
import { mockObjects, mockTones, mockSpeakers } from './mockData';
import Button from '../../../Shared/Button/Button';

const cls = new Bem('project-analytics');

// Моковые сервисы, удалить как будет Api для новых сущностей
const mockToneService = { get: () => Promise.resolve({ data: mockTones }) };
const mockSpeakerService = { get: () => Promise.resolve({ data: mockSpeakers }) };

function ProjectAnalytics(props) {
    const {} = props;

    const [objects, setObject] = useState([]);
    const [activeObjectId, setActiveObjectId] = useState('');
    const [activeObject, setActiveObject] = useState({});

    useEffect(() => {
        setObject(mockObjects);
    }, []);

    useEffect(() => {
        const object = objects.find((obj) => obj.id === activeObjectId);
        if (object) {
            setActiveObject(object);
        }
    }, [activeObjectId]);

    return (
        <section {...cls()}>
            <ul {...cls('objects')}>
                {objects.map((object, index) => (
                    <li {...cls('object-item')} key={object.id || index}>
                        <Button
                            {...cls('object-button', 'active')}
                            onClick={() => setActiveObjectId(object.id)}
                            style={ object.id === activeObjectId ? 'success' : 'default' }
                        >
                            {object.name}
                        </Button>
                    </li>
                ))}
            </ul>
            <AnalyticsObject
                {...cls('object-settings')}
                toneService={ mockToneService }
                speakerService={mockSpeakerService}
                object={ activeObject }
                objects={ objects }
            />
        </section>
    );
}

export default ProjectAnalytics;
