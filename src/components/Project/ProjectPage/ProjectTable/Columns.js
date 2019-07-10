import {StorageService} from '../../../../services';
import {STORAGE_KEY} from '../../../../constants/LocalStorageKeys';

export const COLUMN_TYPE = {
    date: 'date',
    source: 'source',
    title: 'title',
    annotation: 'annotation',
    authors: 'authors',
    city: 'city',
    region: 'region',
    federalDistrict: 'federalDistrict',
    typeMedia: 'typeMedia',
    text: 'text'
};
export const COLUMN_NAME = {
    date: 'Дата',
    source: 'Источник',
    title: 'Заголовок',
    annotation: 'Аннотация',
    authors: 'Автор',
    city: 'Город',
    region: 'Область/край',
    federalDistrict: 'Федеральный округ',
    typeMedia: 'Тип СМИ',
    text: 'Текст статьи'
};

export const getColumnsFromStorage = () => {
    const storageValue = StorageService.get(STORAGE_KEY.PROJECT_TABLE_COLUMNS);
    const storageColumns = storageValue && JSON.parse(storageValue);

    if (!storageColumns) return null;

    const verifyColumns = storageColumns.filter(column => !!COLUMN_TYPE[column]);

    if (verifyColumns.length !== storageColumns.length) {
        StorageService.set(STORAGE_KEY.PROJECT_TABLE_COLUMNS, JSON.stringify(verifyColumns));
    }

    return verifyColumns;
};

export const DEFAULT_COLUMNS = ['date', 'source', 'title', 'annotation'];
