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
        quoteLevelService,
        quoteTypeService,
        onEditCompanySpeaker,
        onChangeCompanySpeaker
    } = props;

    const [speaker, setSpeaker] = useState(null);
    const [quoteLevel, setQuoteLevel] = useState(null);
    const [quoteType, setQuoteType] = useState(null);
    const [speakerIn, setSpeakerIn] = useState([]);
    const [warningMessage, setWarningMessage] = useState('');

    useEffect(() => {
        if (companySpeaker?.speaker) {
            setSpeaker(companySpeaker.speaker);
        }

        const speakerInList = objects
            .filter((object) => {
                return object.companySpeakers.find((cs) => cs.speaker === companySpeaker.speaker);
            })
            .map((object) => object.name);

        setSpeakerIn(speakerInList);

        const iSspeakerInIgnoreWarning = JSON.parse(localStorage.getItem(SPEAKERS_IGNORE_WARNING_LOCAL_STORAGE_KEY))
            ?.includes(companySpeaker?.speaker);

        console.log(iSspeakerInIgnoreWarning);

        if (speakerInList.length > 1 && !iSspeakerInIgnoreWarning) {
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

    const handleEditCompanySpeaker = (value, setter) => {
        setter(value);
        onEditCompanySpeaker();
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
                    requestService={filterSpeakerService.get}
                    onChange={handleChangeCompanySpeaker}
                    onCreateOption={() => {}}
                />
                <ul {...cls('speaker-in-list')}>
                    {speakerIn.map((object, index) => (
                        <li {...cls('speaker-in-item', {warning: warningMessage})} key={index}> { object } </li>
                    ))}
                </ul>
                <AsyncCreateableSelect
                    {...cls('select')}
                    placeholder="Уровень"
                    selected={quoteLevel}
                    editable
                    required
                    requestService={quoteLevelService.get}
                    onChange={(evt) => handleEditCompanySpeaker(evt?.value || null, setQuoteLevel)}
                    onCreateOption={() => {}}
                />
                <AsyncCreateableSelect
                    {...cls('select')}
                    placeholder="Тип цитат"
                    selected={quoteType}
                    editable
                    required
                    requestService={quoteTypeService.get}
                    onChange={(evt) => handleEditCompanySpeaker(evt?.value || null, setQuoteType)}
                    onCreateOption={() => {}}
                />
            </div>
            {warningMessage && (
                <div {...cls('warning')}>
                    <span {...cls('warning-message')}>{warningMessage}</span>
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
    );
}

export default CompanySpeaker;
