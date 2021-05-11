import React, { useState } from 'react';
import ConfirmModal from "../../../Shared/ConfirmModal/ConfirmModal";
import InputText from "../../../Form/InputText/InputText";

export default function SettingsCategoryModal({
    onClose,
    onSubmit
}) {
    const [value, setValue] = useState('');

    return (
        <ConfirmModal
            title='Создание категории'
            onClose={onClose}
            submitText='Добавить'
            submitDisabled={value.length < 2}
            onSubmit={onSubmit}
            width='small'
        >
            <InputText
                value={value}
                onChange={setValue}
            />
        </ConfirmModal>
    );
}
