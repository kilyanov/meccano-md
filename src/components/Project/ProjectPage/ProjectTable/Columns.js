import {StorageService} from '../../../../services';
import {STORAGE_KEY} from '../../../../constants/LocalStorageKeys';

export const getColumnsFromFields = (fields) => {
    return fields.map(({slug}) => slug);
};

export const getColumnsFromStorage = (projectId, projectColumns) => {
    const storageData = StorageService.get(STORAGE_KEY.PROJECT_TABLE_COLUMNS);

    let storageProjects = storageData && JSON.parse(storageData);

    // Удаляем старые значения
    if (
        !storageProjects ||
        storageProjects instanceof Array ||
        storageProjects[projectId] && storageProjects[projectId].some(item => _.isString(item))
    ) {
        storageProjects = {};
    }

    if (!storageProjects || !storageProjects[projectId]) {
        setColumnsToStorage(DEFAULT_COLUMNS, projectColumns, projectId);
        return DEFAULT_COLUMNS;
    }

    const storageColumns = storageProjects[projectId];
    const verifyColumns = projectColumns.length ? getVerifyColumns(storageColumns, projectColumns) : storageColumns;

    if (verifyColumns.length && verifyColumns.length !== storageColumns.length) {
        setColumnsToStorage(DEFAULT_COLUMNS, projectColumns, projectId);
    }

    return verifyColumns.length ? verifyColumns : DEFAULT_COLUMNS;
};

export const setColumnsToStorage = (selectedColumns, projectColumns, projectId) => {
    const storageData = StorageService.get(STORAGE_KEY.PROJECT_TABLE_COLUMNS);

    let storageProjects = storageData && JSON.parse(storageData);

    if (!storageProjects || storageProjects instanceof Array) {
        storageProjects = {};
    }

    const verifyColumns = getVerifyColumns(selectedColumns, projectColumns);

    storageProjects[projectId] = verifyColumns.length ? verifyColumns : DEFAULT_COLUMNS;
    StorageService.set(STORAGE_KEY.PROJECT_TABLE_COLUMNS, JSON.stringify(storageProjects));
};

export const updateColumnWidth = (projectId, columnKey, newWidth) => {
    const storageData = StorageService.get(STORAGE_KEY.PROJECT_TABLE_COLUMNS);
    const storageProjects = storageData && JSON.parse(storageData);

    if (storageProjects && storageProjects[projectId]) {
        storageProjects[projectId].forEach(column => {
            if (column.key === columnKey) {
                column.width = newWidth;
            }
        });
    }

    StorageService.set(STORAGE_KEY.PROJECT_TABLE_COLUMNS, JSON.stringify(storageProjects));
};

export const DEFAULT_COLUMN_WIDTH = 0;

export const DEFAULT_COLUMNS = [
    {key: 'date', width: DEFAULT_COLUMN_WIDTH},
    {key: 'source_id', width: DEFAULT_COLUMN_WIDTH},
    {key: 'title', width: DEFAULT_COLUMN_WIDTH},
    {key: 'annotation', width: DEFAULT_COLUMN_WIDTH}
];

const getVerifyColumns = (selectedColumns, projectColumns) => {
    return selectedColumns.filter(({key}) => projectColumns.includes(key));
};
