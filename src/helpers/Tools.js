import PerfectScrollbar from 'perfect-scrollbar';
import API from '../api/api';
import {EventEmitter} from './EventEmitter';
import {EVENTS} from '../constants/Events';

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

export const arrayMove = (array, from, to) => {
    const newArray = array.slice();

    newArray.splice(to < 0 ? newArray.length + to : to, 0, newArray.splice(from, 1)[0]);
    return newArray;
};

export const Plural = (n, base, words) => {
    const number = Math.abs(parseInt(n));

    let resultWord = words[0];

    if (number % 100 > 10 && number % 100 < 20) resultWord = words[2];
    else if (number % 10 === 1) resultWord = words[0];
    else if (number % 10 >= 2 && number % 10 <= 4) resultWord = words[1];
    else resultWord = words[2];

    return base + resultWord;
};

export const OperatedNotification = {
    container: document.getElementById('operated-notifications'),
    info: (notification) => EventEmitter.emit(EVENTS.OPERATED_NOTIFICATION.SHOW, {...notification, type: 'info'}),
    success: (notification) => EventEmitter.emit(EVENTS.OPERATED_NOTIFICATION.SHOW, {...notification, type: 'success'}),
    warning: (notification) => EventEmitter.emit(EVENTS.OPERATED_NOTIFICATION.SHOW, {...notification, type: 'warning'}),
    error: (notification) => EventEmitter.emit(EVENTS.OPERATED_NOTIFICATION.SHOW, {...notification, type: 'error'})
};
