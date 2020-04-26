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

export const alt = {
    set: immutable.set,
    merge: immutable.merge,
    insert: immutable.insert,
    push: immutable.push,
    del: immutable.del
}

export const EVENTS = {
    TRANSFORM_PLACEHOLDER_ELEMENT_CLICK: 'TRANSFORM_PLACEHOLDER_ELEMENT_CLICK',
};

export const TinyEmitter = new _TinyEmitter();

