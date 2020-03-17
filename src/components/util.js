import ReactDOM from 'react-dom';

/**
 * copy from slate.js
 * create React portal on body
 */
export const Portal = ({ children }) => {
    return (
        ReactDOM.createPortal(children, document.body)
    )
}

/**
 * copy from npm - delegate
 * Finds the closest parent that matches a selector.
 *
 * @param {Element} element
 * @param {String} selector
 * @return {Function}
 */
export function closest(element, selector) {
    while (element && element !== document.body) {
        if (
            typeof element.matches === 'function' &&element.matches(selector)
        ) {
            return element;
        }
        element = element.parentNode;
    }
    return;
}