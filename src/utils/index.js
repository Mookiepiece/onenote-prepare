import { TinyEmitter as _TinyEmitter } from 'tiny-emitter';
import * as immutable from 'object-path-immutable';

export const deepCopy = v => JSON.parse(JSON.stringify(v));

/**
 * set an array item
 * if index was negative, -1 represents the last one
 * if a function was provieded instead of item, excute it with the item in that place as argument
 */
export const setArrayItem = (array, index, item) => {
    index < 0 && (index = array.length + index);

    if (typeof item === 'function') {
        item = item(array[index])
    }

    return [
        ...array.slice(0, index),
        item,
        ...array.slice(index + 1, array.length)
    ]
}

/**
 * used by object array, use item keys override object keys
 */
export const altArrayItem = (array, index, item) => {
    return [
        ...array.slice(0, index),
        { ...array[index], ...item },
        ...array.slice(index + 1, array.length)
    ]
}

/**
 * dig into the key specified in root object and assign it with item, pure function
 */
export const altObject = (rootObject, key, item) => {
    const keys = typeof key === 'string' ? key.split('.') : [key];

    const R = (obj, index) => {
        const isArray = Array.isArray(obj);
        if (index === keys.length) {
            if (typeof obj !== 'object' || isArray) {
                throw new Error('[altObj] it is not an object');
            }
            return {
                ...obj,
                ...item
            };
        }

        let key = keys[index];
        if (isArray) {
            return setArrayItem(obj, Number(key), R(obj[key], index + 1));
        }
        else {
            return {
                ...obj,
                [key]: R(obj[key], index + 1)
            };
        }
    }
    return R(rootObject, 0);
}

export const alt = {
    nearleaf(object, path) {
        if (path.length === 0)
            throw new Error('[alt] param $path not valid');
        return path.slice(0, path.length - 1).reduce((obj, p) => obj[p], object);
    },
    set: immutable.set,
    merge:immutable.merge
}

/**
 * dig into the key specified in root object and replace it with item, pure function
 */
export const setObject = (rootObject, key, item) => {
    const keys = typeof key === 'string' ? key.split('.') : [key];

    const R = (obj, index) => {
        const isArray = Array.isArray(obj);
        if (index === keys.length) {
            return item;
        }

        let key = keys[index];
        if (isArray) {
            return setArrayItem(obj, Number(key), R(obj[key], index + 1));
        }
        else {
            return {
                ...obj,
                [key]: R(obj[key], index + 1)
            };
        }
    }
    return R(rootObject, 0);
}

export const removeArrayItem = (array, index) => {
    return [
        ...array.slice(0, index),
        ...array.slice(index + 1, array.length)
    ];
}

export const TinyEmitter = new _TinyEmitter();