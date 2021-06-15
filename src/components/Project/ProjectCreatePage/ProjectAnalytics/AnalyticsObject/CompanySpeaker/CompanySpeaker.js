import React, { useEffect, useState } from 'react';
import AsyncCreateableSelect from '../../../../../Form/AsyncCreatebleSelect/AsyncCreateableSelect';
import './company-speaker.scss';

const cls = new Bem('company-speaker');

function CompanySpeaker(props) {
    const {
        className: mix = '',
        companySpeaker,
        companySpeakers,
        companySpeakersIndex,
        objects,
        speakerService,
        onChangeCompanySpeaker
    } = props;

    const [speaker, setSpeaker] = useState('');

    useEffect(() => {
        if (companySpeaker?.id) {
            setSpeaker(companySpeaker.speaker);
        }
    }, [companySpeaker]);

    if (!companySpeakers.length) {
        return (
            <section {...cls('', '', mix)}>
                Нажмите + чтобы добавить спикера компании
            </section>
        );
    }

    const speakerIn = objects
        .filter((object) => {
            return object.companySpeakers.find((cs) => cs.speaker === companySpeaker.speaker);
        })
        .map((object) => object.name);

    const filterSpeakerService = {
        get: (req) => {
            return new Promise((resolve, reject) => {
                speakerService.get(req)
                    .then((res) => {
                        const filteredRes = res.data.filter((d) => {
                            if (companySpeaker.speaker === d.id) {
                                return true;
                            }
                            return !companySpeakers.find((cs) => {
                                return cs.speaker === d.id;
                            });
                        });
                        resolve({ data: filteredRes });
                    })
                    .catch(reject);
            });
        }
    };

    const handleChangeCompanySpeaker = (evt) => {
        setSpeaker(evt?.value || null);
        onChangeCompanySpeaker(evt, companySpeakersIndex);
    };

    return (
        <div {...cls('', '', mix)}>
            <AsyncCreateableSelect
                {...cls('select')}
                placeholder="Спикер компании"
                selected={speaker}
                editable
                required
                options={[]}
                requestService={filterSpeakerService.get}
                onChange={handleChangeCompanySpeaker}
                onCreateOption={() => {}}
            />
            <ul {...cls('speaker-in-list')}>
                {speakerIn.map((object, index) => (
                    <li {...cls('speaker-in-item')} key={index}> { object } </li>
                ))}
            </ul>
        </div>
    );
}

export default CompanySpeaker;
