export const Tools = {
    parseFormToRequest: (form) => (
        `?${Object.keys(form).map(key => `${key}=${form[key]}`).join('&')}`
    )
};
