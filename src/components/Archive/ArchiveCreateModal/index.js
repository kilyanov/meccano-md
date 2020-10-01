import React, { useState } from 'react';
import TextArea from "../../Form/TextArea/TextArea";
import ConfirmModal from "../../Shared/ConfirmModal/ConfirmModal";
import { ArchiveService } from "../../../services";
import { NotificationManager } from "react-notifications";
import Loader from "../../Shared/Loader/Loader";

import './archive-create-modal.scss';

export default function ArchiveCreateModal({
    projectId,
    articleIds = [], 
    onSuccessCreate = () => {}, 
    onClose, 
    isAll = false 
}) {
    const [ description, setDescription ] = useState('');
    const [ inProgress, setInProgress ] = useState(false);
    const handleSubmit = () => {
        if (!projectId || !articleIds.length) {
            return;
        }

        setInProgress(true);

        ArchiveService
            .create(projectId, isAll ? [] : articleIds, description, isAll)
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
            className='archive-create-modal'
            title='Создание архива'
            onClose={onClose}
            submitDisabled={!articleIds.length}
            submitText='Создать и перенести статьи'
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