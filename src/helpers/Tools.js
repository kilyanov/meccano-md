import PerfectScrollbar from 'perfect-scrollbar';

export const Tools = {
    parseFormToRequest: (form) => (
        `?${Object.keys(form).map(key => `${key}=${form[key]}`).join('&')}`
    ),
    isMobileScreen: () => {
        return window.innerWidth <= 800;
    },
    isMobileBrowser: () => {
        return navigator.userAgent.match(/Android/i)
        || navigator.userAgent.match(/webOS/i)
        || navigator.userAgent.match(/iPhone/i)
        || navigator.userAgent.match(/iPad/i)
        || navigator.userAgent.match(/iPod/i)
        || navigator.userAgent.match(/BlackBerry/i)
        || navigator.userAgent.match(/Windows Phone/i);
    },
    initScrollbar: (node, options) => {
        if (node && !node.classList.contains('ps')) {
            if (getComputedStyle(node).position === 'static') node.style.position = 'relative';

            /* eslint-disable no-unused-vars */
            return new PerfectScrollbar(node, options);
            /* eslint-enable no-unused-vars */
        }
    }
};
