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
        quoteCategoryService,
        onEditOutsideSpeaker,
        onChangeOutsideSpeaker
    } = props;

    const [speaker, setSpeaker] = useState(null);
    const [category, setCategory] = useState(null);

    useEffect(() => {
        if (outsideSpeaker?.speaker) {
            setSpeaker(outsideSpeaker.speaker);
        }
    }, [outsideSpeaker]);


    if (!outsideSpeakers.length) {
        return (
            <section {...cls('', '', mix)}>
                Нажмите + чтобы добавить стороннего спикера
            </section>
        );
    }

    const filterSpeakerService = {
        get: (req) => {
            return new Promise((resolve, reject) => {
                speakerService.get(req)
                    .then((res) => {
                        const filteredRes = res.data.filter((d) => {
                            if (outsideSpeaker.speaker === d.id) {
                                return true;
                            }
                            return !outsideSpeakers.find((cs) => {
                                return cs.speaker === d.id;
                            });
                        });
                        resolve({ data: filteredRes });
                    })
                    .catch(reject);
            });
        }
    };

    const handleEditOutsideSpeaker = (value, setter) => {
        setter(value);
        onEditOutsideSpeaker();
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
                    requestService={filterSpeakerService.get}
                    onChange={handleChangeOutsideSpeaker}
                    onCreateOption={() => {}}
                />
                <AsyncCreateableSelect
                    {...cls('select')}
                    placeholder="Категория"
                    selected={category}
                    editable
                    required
                    requestService={quoteCategoryService.get}
                    onChange={(evt) => handleEditOutsideSpeaker(evt?.value || null, setCategory)}
                    onCreateOption={() => {}}
                />
            </div>
        </div>
    );
}

export default OutsideSpeaker;
