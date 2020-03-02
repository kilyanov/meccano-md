import PerfectScrollbar from 'perfect-scrollbar';
import {EventEmitter} from './EventEmitter';
import {EVENTS} from '../constants/Events';

export const ParseToRequest = (form) => {
    if (!form) return '';

    return `?${Object.keys(form).map(key => `${key}=${form[key]}`).join('&')}`;
};

export const isMobileScreen = () => {
    return window.outerWidth <= 800;
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

export const QueueManager = {
    push(message) {
        EventEmitter.emit(EVENTS.QUEUE_MANAGER.PUSH, message);
    },
    remove(id) {
        EventEmitter.emit(EVENTS.QUEUE_MANAGER.REMOVE, id);
    }
};

export const isAccess = (arrayOfPermissions, profile) => {
    if (!profile || !profile.permissions) return false;

    return !!profile.permissions.filter(({name}) => arrayOfPermissions.includes(name)).length;
};

export const isProjectAccess = (permissions = [], userProject) => {
    if (!userProject || !permissions.length) return false;

    return userProject && permissions.some(pm => userProject.hasOwnProperty(pm) && userProject[pm]);
};
