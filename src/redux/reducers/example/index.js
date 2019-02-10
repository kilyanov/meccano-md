export function example(state = {}, action) {
    switch (action.type) {
        case 'ACCOUNT_LOADED':
            return {loaded: true};
        default:
            return state;
    }
}
