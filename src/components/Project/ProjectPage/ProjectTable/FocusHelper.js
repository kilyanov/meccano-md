export default class FocusHelper {
    constructor() {
        this.elements = [ ...document.querySelectorAll(
            '.editable-cell__wrap[tabindex]:not([tabindex="-1"]):not(:disabled)'
        )];
    }

    focusNext(currEl) {
        if (!currEl) return;
        const currentIndex = this.elements.indexOf(currEl);

        if (currentIndex > -1) {
            this.elements[currentIndex + 1].focus();
        }
    }

    focusPrev(currEl) {
        if (!currEl) return;
        const currentIndex = this.elements.indexOf(currEl);

        if (currentIndex > -1 && currentIndex - 1 > -1) {
            this.elements[currentIndex - 1].focus();
        }
    }
}
