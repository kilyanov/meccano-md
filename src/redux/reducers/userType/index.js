import { ACTION_TYPE, STORAGE_KEY } from '../../../constants';

let initialState = localStorage.getItem(STORAGE_KEY.USER_TYPE);

if (initialState) {
    try {
        initialState = JSON.parse(initialState);
    } catch (e) {
        console.error(e);
    }
}

export function userType(state = initialState, action) {
    switch (action.type) {
        case ACTION_TYPE.USER.TYPE.SET:
            if (action.payload) {
                localStorage.setItem(STORAGE_KEY.USER_TYPE, JSON.stringify(action.payload));
            }
            return action.payload;
        default:
            return state;
    }
}
