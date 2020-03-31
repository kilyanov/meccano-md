import { DB_STORE } from "../constants/DB_STORE";
import {EventEmitter} from "../helpers";

const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
const baseName = 'Meccano_Base';
const baseVersion = 1;
const logError = event => console.error(event);
const logInfo = message => console.info(`%cDBStore: %c${message}`, 'color: #2a62d3', 'color: #999');

export const DBService = {
    connect(version = undefined) {
        return new Promise(resolve => {
            const request = indexedDB.open(baseName, version);

            request.onerror = logError;
            request.onsuccess = () => {
                const db = request.result;

                // Если версия БД больше необходимой, пересоздаем базу
                if (db.version > baseVersion) {
                    db.close();
                    const deleteRequest = indexedDB.deleteDatabase(baseName);

                    deleteRequest.onblocked = () => logInfo('Операция заблокирована');
                    deleteRequest.onerror = logError;
                    deleteRequest.onsuccess = () => {
                        return this.connect().then(resolve);
                    };
                }

                // Если версия БД меньше текущей - обновляем
                if (db.version < baseVersion) {
                    db.close();
                    return DBService.connect(baseVersion).then(resolve);
                }

                if (db.version === baseVersion) {
                    return resolve(db);
                }
            };
            request.onupgradeneeded = event => {
                logInfo(`Update store to ${baseVersion} version`);
                const db = event.target.result;

                // Для добавления нового стора (таблицы), необходимо проинкрементить версию бд (version++)
                // иначе onupgradeneeded не будет вызван
                Object.values(DB_STORE).forEach(table => {
                    if (!db.objectStoreNames.contains(table.name)) {
                        db.createObjectStore(table.name, table.params);
                    }
                });

                db.onversionchange = (e) => e.target.close();

                return DBService.connect().then(resolve);
            };
            request.onblocked = () => {
                logInfo('Операция заблокирована');
            };
        });
    },
    deleteDatabase() {
        logInfo('Удаляем БД');
        const deleteRequest = indexedDB.deleteDatabase(baseName);

        deleteRequest.onblocked = () => {
            logError('Операция заблокирована');
        };
        deleteRequest.onerror = logError;
        deleteRequest.onsuccess = () => logInfo('Удаление БД завершено');
        deleteRequest.onupgradeneeded = () => logInfo('>>>');

        return deleteRequest;
    },
    getByKey(storeName, key) {
        if (!storeName || !key) return;

        return new Promise(resolve => {
            return this.connect().then(db => {
                const request = db
                    .transaction(storeName, 'readonly')
                    .objectStore(storeName)
                    .get(key);

                request.onerror = logError;
                request.onsuccess = () => {
                    db.close();

                    return resolve(request.result);
                };
            });
        });
    },
    set(storeName, object, /* fireEvent = true */) {
        if (!storeName || !object) return;

        return new Promise(resolve => {
            return this.connect().then(db => {
                const request = db
                    .transaction(storeName, 'readwrite')
                    .objectStore(storeName)
                    .put(object);

                request.onerror = logError;
                request.onsuccess = () => {
                    db.close();

                    return resolve(request.result);
                };
            });
        });
        // .then(() => fireEvent && EventEmitter.emit(EVENT.DB[`${storeName.toUpperCase()}_UPDATE`]));
    },
    delete(storeName, keys) {
        if (!storeName || !keys) return;

        logInfo(`Delete from "${storeName}": ${keys}`);

        return new Promise(resolve => {
            return this.connect().then(db => {
                const request = db
                    .transaction([storeName], 'readwrite')
                    .objectStore(storeName);

                if (Array.isArray(keys)) {
                    keys.forEach(key => request.delete(key));
                } else {
                    request.delete(keys);
                }

                request.onerror = logError;
                request.onsuccess = () => {
                    db.close();

                    return resolve('File delete from DB:', keys);
                };
            });
        });
        // .then(() => EventEmitter.emit(EVENT.DB[`${storeName.toUpperCase()}_UPDATE`]));
    },
    getStore(storeName) {
        if (!storeName) return;

        return new Promise(resolve => {
            return this.connect().then(db => {
                const request = db
                    .transaction(storeName, 'readonly')
                    .objectStore(storeName)
                    .getAll();

                request.onerror = logError;
                request.onsuccess = () => {
                    db.close();

                    // Если таблица пустая, запросим все с сервера
                    // if (!request.result.length) {
                    //     return DBService.downloadFromServer[storeName]().then(result => resolve(result));
                    // }

                    return resolve(request.result);
                };
            });
        });
    },
    setStore(storeName, list, /* fireEvent = true */) {
        if (!storeName || !list) return;

        logInfo(`setStore "${storeName}"`);

        return new Promise(resolve => {
            return this.connect().then(db => {
                const request = db
                    .transaction(storeName, 'readwrite')
                    .objectStore(storeName);

                list.forEach(object => request.put(object));

                request.onerror = logError;
                request.onsuccess = () => {
                    db.close();

                    return resolve(request.result);
                };
            });
        });
        //     .then((data) => {
        //     if (fireEvent) {
        //         EventEmitter.emit(EVENT.DB[`${storeName.toUpperCase()}_UPDATE`]);
        //     }
        //
        //     return data;
        // });
    },
    clearStore(storeName) {
        if (!storeName) return;

        logInfo(`Clear store ${storeName}`);
        return new Promise(resolve => {
            return this.connect().then(db => {
                const transaction = db.transaction(storeName, 'readwrite');
                const objectStore = transaction.objectStore(storeName);

                objectStore.clear();

                transaction.oncomplete = () => {
                    db.close();

                    return resolve();
                };
            });
        });
    },
};
