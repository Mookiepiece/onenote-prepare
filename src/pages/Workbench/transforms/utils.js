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
    },

    slibings(root, elPath, count = 1) {
        const containerPath = elPath.slice(0, -1);
        const elIndex = elPath[elPath.length - 1];
        const containerEl = Children.getEl(root, containerPath); // NOTE: will get {children:root} when path=[]
        const slibings = containerEl.children;

        return [slibings.slice(0, elIndex), slibings.slice(elIndex + count, slibings.length)];
    }
}

export default Children;