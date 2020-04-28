// an toolkit to help iterate editor.children
const Children = {
    /**
     * iterate the slate children
     * @param {Node} el 
     * @param {Array} path 
     * @param {Array} children 
     * @param {Function} callback 
     */
    iterate(el, path, children, callback) {
        if (callback(el, path, children)) {  //TODO many 'return true;' in callback
            el.children && el.children.forEach((el, index) => this.iterate(el, [...path, index], children, callback));
        }
    },
    /**
     * path to string for alt.set
     * @param {Array} path 
     */
    str(path) {
        return path.length ? `${path.join('.children.')}.children` : '';
    },
    /**
     * get el form root,
     * if path is empty, return an object { children: root }
     * @param {Array} root 
     * @param {Array} path 
     * @return {Object} object with children[]
     */
    getEl(root, path) {
        return path.reduce((el, p) => el.children[p], { children: root });
    }
}

export default Children;