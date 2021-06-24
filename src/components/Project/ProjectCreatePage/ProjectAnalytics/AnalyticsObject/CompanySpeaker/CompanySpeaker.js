import React, { useEffect, useState } from 'react';
import AsyncCreateableSelect from '../../../../../Form/AsyncCreatebleSelect/AsyncCreateableSelect';
import './company-speaker.scss';
import Button from '../../../../../Shared/Button/Button';

const cls = new Bem('company-speaker');

const SPEAKERS_IGNORE_WARNING_LOCAL_STORAGE_KEY = 'speakers-ignore-warning';

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

    const [speaker, setSpeaker] = useState(null);
    const [speakerIn, setSpeakerIn] = useState([]);
    const [warningMessage, setWarningMessage] = useState('');

    useEffect(() => {
        if (companySpeaker) {
            setSpeaker(companySpeaker);
        }

        const speakerInList = objects
            .filter((object) => {
                return object.companySpeakers.find((cs) => cs === companySpeaker);
            })
            .map((object) => object.name);

        setSpeakerIn(speakerInList);

        const isSpeakerInIgnoreWarning = JSON.parse(localStorage.getItem(SPEAKERS_IGNORE_WARNING_LOCAL_STORAGE_KEY))
            ?.includes(companySpeaker);

        if (speakerInList.length > 1 && !isSpeakerInIgnoreWarning) {
            setWarningMessage('Данный спикер представляет несколько компаний!');
        } else {
            setWarningMessage('');
        }
    }, [companySpeaker]);

    if (!companySpeakers.length) {
        return (
            <section {...cls('', '', mix)}>
                Нажмите + чтобы добавить спикера компании
            </section>
        );
    }

    const filterSpeakerService = (req) => {
        return new Promise((resolve, reject) => {
            speakerService.get(req)
                .then((res) => {
                    const filteredRes = res.data.filter((d) => {
                        if (companySpeaker === d.id) {
                            return true;
                        }
                        return !companySpeakers.find((cs) => {
                            return cs === d.id;
                        });
                    });
                    resolve({ data: filteredRes });
                })
                .catch(reject);
        });
    };

    const handleChangeCompanySpeaker = (evt) => {
        setSpeaker(evt?.value || null);
        onChangeCompanySpeaker(evt, companySpeakersIndex);
    };

    const saveIgnoreWarningForSpeaker = () => {
        const speakersIgnoreWarning = JSON.parse(localStorage.getItem(SPEAKERS_IGNORE_WARNING_LOCAL_STORAGE_KEY));
        if (!speakersIgnoreWarning) {
            localStorage.setItem(
                SPEAKERS_IGNORE_WARNING_LOCAL_STORAGE_KEY,
                JSON.stringify([speaker])
            );
        } else {
            localStorage.setItem(
                SPEAKERS_IGNORE_WARNING_LOCAL_STORAGE_KEY,
                JSON.stringify([...speakersIgnoreWarning, speaker])
            );
        }
        setWarningMessage('');
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
                    onChange={handleChangeCompanySpeaker}
                    onCreateOption={() => {}}
                />
                {warningMessage && (
                    <div {...cls('warning')}>
                        <span {...cls('warning-message')}>{warningMessage} {speakerIn.join(', ')}</span>
                        <Button
                            {...cls('warning-reset-button')}
                            style="inline"
                            onClick={saveIgnoreWarningForSpeaker}
                        >
                            Ok
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CompanySpeaker;
