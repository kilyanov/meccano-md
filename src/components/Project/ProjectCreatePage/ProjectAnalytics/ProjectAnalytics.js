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

const cls = new Bem('project-analytics');

function ProjectAnalytics(props) {
    const {} = props;

    const [objects, setObject] = useState([]);
    const [activeObjectId, setActiveObjectId] = useState('');
    const [activeObject, setActiveObject] = useState({});

    useEffect(() => {
        objectService.get()
            .then(({ data }) => setObject(data));
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
                toneService={ toneService }
                speakerService={speakerService}
                quoteLevelService={quoteLevelService}
                quoteTypeService={quoteTypeService}
                object={ activeObject }
                objects={ objects }
            />
        </section>
    );
}

export default ProjectAnalytics;
