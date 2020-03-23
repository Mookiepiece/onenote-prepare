/**
 * interate the slate vdom tree
 * @param {Node} el 
 * @param {Array} path 
 * @param {Array} children 
 * @param {Function} callback 
 */
export const interator = (el, path, children, callback) => {
    if (callback(el, path, children)) {  //TODO many 'return true;' in callback
        el.children && el.children.forEach((el, index) => interator(el, [...path, index], children, callback));
    }
}