import React, { useCallback, useState } from 'react';
import ConfirmModal from '../../../../Shared/ConfirmModal/ConfirmModal';
import ExampleImg from '../../../../../assets/img/images/import-structure-example.png';
import InputFile from '../../../../Form/InputFile/InputFile';
import { NotificationManager } from 'react-notifications';
import Loader from '../../../../Shared/Loader/Loader';
import { ProjectService } from '../../../../../services';

export default function SectionsImportModal({
    onClose,
    onSubmit,
    projectId
}) {
    const [file, setFile] = useState(null);
    const [inProgress, setInProgress] = useState(false);

    const handleChangeFile = useCallback((files) => {
        setFile(files[0]);
    }, []);

    const handleSubmit = useCallback(() => {
        if (!file) {
            return NotificationManager.error('Не выбран файл для импорта или файл не корректный', 'Ошибка');
        }

        const form = new FormData();

        form.append('file', file);

        setInProgress(true);

        ProjectService.sections
            .import(projectId, form)
            .then(() => {
                NotificationManager.success('Импорт успешно завершен', 'Импорт структуры');
                onSubmit();
                onClose();
            })
            .finally(() => {
                setInProgress(false);
            });
    }, [file]);


    return (
        <ConfirmModal
            title='Импорт структуры'
            onClose={onClose}
            submitDisabled={!file}
            onSubmit={handleSubmit}
        >

            <InputFile
                accept={['xls', 'xlsx']}
                onChange={handleChangeFile}
                required
            />

            <p>Выберите файл Excel, оформленный как на изображении снизу</p>

            <img
                src={ExampleImg} alt="Пример файла Excel"
                style={{
                    margin: '10px 0',
                    width: '500px'
                }}
            />

            {inProgress && <Loader />}
        </ConfirmModal>
    );
}
