import React, { useState } from 'react';
import TextArea from "../../Form/TextArea/TextArea";
import ConfirmModal from "../../Shared/ConfirmModal/ConfirmModal";
import { ArchiveService } from "../../../services";
import { NotificationManager } from "react-notifications";
import Loader from "../../Shared/Loader/Loader";

export default function ArchiveCreateModal({ projectId, articleIds = [], onSuccessCreate = () => {}, onClose }) {
    const [ description, setDescription ] = useState('');
    const [ inProgress, setInProgress ] = useState(false);
    const handleSubmit = () => {
        if (!projectId || !articleIds.length) {
            return;
        }

        setInProgress(true);
        ArchiveService
            .create(projectId, articleIds, description)
            .then(() => {
                NotificationManager.success('Архив усмешно создан', 'Архив');
                setInProgress(false);
                onSuccessCreate();
                onClose();
            })
            .catch(() => setInProgress(false));
    };

    return (
        <ConfirmModal
            title='Создание архива'
            onClose={onClose}
            submitDisabled={!articleIds.length}
            submitText='В архив'
            submitStyle='error'
            onSubmit={handleSubmit}
            width='small'
        >
            <TextArea
                placeholder='Описание'
                value={description}
                onChange={value => setDescription(value)}
            />

            {inProgress && <Loader/>}
        </ConfirmModal>
    );
}