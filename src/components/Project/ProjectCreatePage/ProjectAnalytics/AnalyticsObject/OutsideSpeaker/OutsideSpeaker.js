import React, { useEffect, useState } from 'react';
import AsyncCreateableSelect from '../../../../../Form/AsyncCreatebleSelect/AsyncCreateableSelect';
import './outside-speaker.scss';

const cls = new Bem('outside-speaker');

function OutsideSpeaker(props) {
    const {
        className: mix = '',
        outsideSpeaker,
        outsideSpeakers,
        outsideSpeakersIndex,
        speakerService,
        onChangeOutsideSpeaker
    } = props;

    const [speaker, setSpeaker] = useState(null);

    useEffect(() => {
        if (outsideSpeaker) {
            setSpeaker(outsideSpeaker);
        }
    }, [outsideSpeaker]);


    if (!outsideSpeakers.length) {
        return (
            <section {...cls('', '', mix)}>
                Нажмите + чтобы добавить стороннего спикера
            </section>
        );
    }

    const filterSpeakerService = (req) => {
        return new Promise((resolve, reject) => {
            speakerService.get(req)
                .then((res) => {
                    const filteredRes = res.data.filter((d) => {
                        if (outsideSpeaker === d.id) {
                            return true;
                        }
                        return !outsideSpeakers.find((cs) => {
                            return cs === d.id;
                        });
                    });
                    resolve({ data: filteredRes });
                })
                .catch(reject);
        });
    };

    const handleChangeOutsideSpeaker = (evt) => {
        setSpeaker(evt?.value || null);
        onChangeOutsideSpeaker(evt, outsideSpeakersIndex);
    };

    return (
        <div {...cls('', '', mix)}>
            <div {...cls('fields')}>
                <AsyncCreateableSelect
                    {...cls('select')}
                    placeholder="Спикер компании"
                    selected={speaker}
                    editable
                    required
                    requestService={filterSpeakerService}
                    onChange={handleChangeOutsideSpeaker}
                    onCreateOption={() => {}}
                />
            </div>
        </div>
    );
}

export default OutsideSpeaker;
