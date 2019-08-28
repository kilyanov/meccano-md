import store from 'store';

export const StorageService = {
    get: (key) => store.get(key),
    set: (key, value) => store.set(key, value),
    clear: () => store.clearAll(),
    remove: (key) => store.remove(key)
};
