import React, { useState } from 'react';
import InputText from '../../Form/InputText/InputText';
import InputDateTimePicker from '../../Form/InputDateTimePicker/InputDatePicker';
import Select from '../../Form/Select/Select';
import PropTypes from 'prop-types';
import './reprint.scss';

const cls = new Bem('reprint');

function Reprint({ title, url, source_id: sourceId, city_id: cityId, date }) {
    const [isOpen, setIsOpen] = useState(false);

    const handleOpen = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div {...cls()}>
            <div {...cls('grid', {'opened': isOpen})}>
                <InputText
                    value={title || ''}
                    onChange={value => console.log(value)}
                    required
                    {...cls('field')}
                />
                <InputText
                    value={url || ''}
                    onChange={value => console.log(value)}
                    validateType="link"
                    required
                    {...cls('field')}
                />
                <Select
                    placeholder={'СМИ (Источник)'}
                    options={null || []}
                    selected={sourceId}
                    onChange={value => console.log(value)}
                    {...cls('field')}
                />
                <Select
                    placeholder={'Город'}
                    options={null || []}
                    selected={cityId}
                    onChange={value => console.log(value)}
                    {...cls('field', 'half-size')}
                />
                <InputDateTimePicker
                    value={new Date(date) || null}
                    onChange={value => console.log(value)}
                    readOnly={false}
                    required
                    {...cls('field', 'half-size')}
                />
            </div>
            <button
                {...cls('button-open', {'opened': isOpen})}
                onClick={handleOpen}
                type="button"
                title="Показать все поля"
            />
        </div>
    );
}

Reprint.propTypes = {
    title: PropTypes.string,
    url: PropTypes.string,
    source_id: PropTypes.string,
    city_id: PropTypes.string,
    date: PropTypes.string,
    onOpen: PropTypes.func,
    handleK: PropTypes.func
};

export default Reprint;
