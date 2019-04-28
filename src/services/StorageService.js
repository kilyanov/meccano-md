import store from 'store';

export const StorageService = {
    get: (key) => store.get(key),
    set: (key, value) => {
        console.log('set', key, value);
        store.set(key, value);
        console.log(store.get(key));
    },
    clear: () => store.clearAll(),
    remove: (key) => {
        console.log('remove', key);
        store.remove(key);
    }
};
