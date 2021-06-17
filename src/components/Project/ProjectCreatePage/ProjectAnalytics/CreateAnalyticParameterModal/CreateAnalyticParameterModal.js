import React, { useRef, useState } from 'react';
import ConfirmModal from '../../../../Shared/ConfirmModal/ConfirmModal';
import Form from '../../../../Form/Form/Form';
import InputText from '../../../../Form/InputText/InputText';
import AsyncCreateableSelect from '../../../../Form/AsyncCreatebleSelect/AsyncCreateableSelect';
import { analyticParameterService } from '../mockServices';
import './create-analytic-parameter-modal.scss';
import TextArea from '../../../../Form/TextArea/TextArea';

const cls = new Bem('create-analytic-parameter-modal');

function CreateAnalyticParameterModal(props) {
    const {
        form = {},
        onClose
    } = props;

    const [name, setName] = useState('');
    const [type, setType] = useState(null);
    const [description, setDescription] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);

    const formRef = useRef(null);

    const handleEditObject = (value, setter) => {
        setter(value);
        setIsEditMode(true);
    };

    const handleSubmit = () => {
        setIsEditMode(true);
    };

    return (
        <ConfirmModal
            title="Добавление параметра"
            width="small"
            onClose={onClose}
            onSubmit={handleSubmit}
            submitDisabled={!isEditMode}
        >
            <Form
                onSubmit={handleSubmit}
                ref={formRef}
                validate
            >
                <InputText
                    {...cls('input')}
                    label="Название параметра"
                    placeholder="Введите название параметра"
                    value={name}
                    validateType="notEmpty"
                    onChange={(value) => handleEditObject(value, setName)}
                />
                <AsyncCreateableSelect
                    {...cls('select')}
                    label="Тип параметра"
                    placeholder="Выберете тип параметра"
                    selected={type}
                    required
                    requestService={analyticParameterService.get}
                    onChange={(evt) => handleEditObject(evt?.value || null, setType)}
                    onCreateOption={() => {}}
                />
                <TextArea
                    {...cls('input')}
                    label="Описание параметра"
                    placeholder="Введите описание параметра"
                    value={description}
                    validateType="notEmpty"
                    onChange={(value) => handleEditObject(value, setDescription)}
                />
            </Form>
        </ConfirmModal>
    );
}

export default CreateAnalyticParameterModal;
