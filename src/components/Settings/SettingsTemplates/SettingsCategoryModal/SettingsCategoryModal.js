import React, { useState } from 'react';
import ConfirmModal from "../../../Shared/ConfirmModal/ConfirmModal";
import InputText from "../../../Form/InputText/InputText";

export default function SettingsCategoryModal({
    existCategoriesNames,
    existErrorMessage,
    onClose,
    onSubmit
}) {
    const [value, setValue] = useState('');
    const isError = existCategoriesNames.includes(value.toLowerCase());

    return (
        <ConfirmModal
            title='Создание категории'
            onClose={onClose}
            submitText='Добавить'
            submitDisabled={value.length < 2 || isError}
            onSubmit={() => !isError && onSubmit(value)}
            width='small'
        >
            <InputText
                autoFocus
                value={value}
                onChange={setValue}
                onEnter={() => !isError && onSubmit(value)}
                error={isError}
                validateErrorMessage={existErrorMessage}
            />
        </ConfirmModal>
    );
}
