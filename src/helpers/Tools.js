import PerfectScrollbar from 'perfect-scrollbar';
import API from '../api/api';

export const ParseToRequest = (form) => {
    if (!form) return '';

    return `?${Object.keys(form).map(key => `${key}=${form[key]}`).join('&')}`;
};

export const isMobileScreen = () => {
    return window.innerWidth <= 800;
};

export const isMobileBrowser = () => {
    return navigator.userAgent.match(/Android/i)
    || navigator.userAgent.match(/webOS/i)
    || navigator.userAgent.match(/iPhone/i)
    || navigator.userAgent.match(/iPad/i)
    || navigator.userAgent.match(/iPod/i)
    || navigator.userAgent.match(/BlackBerry/i)
    || navigator.userAgent.match(/Windows Phone/i);
};

export const InitScrollbar = (node, options) => {
    if (node && !node.classList.contains('ps')) {
        if (getComputedStyle(node).position === 'static') node.style.position = 'relative';

        /* eslint-disable no-unused-vars */
        return new PerfectScrollbar(node, options);
        /* eslint-enable no-unused-vars */
    }
};

export const prepareRequest = (type = 'get', url, form) => {
    return API[type](url, form);
};
