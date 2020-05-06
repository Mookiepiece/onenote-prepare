import { TinyEmitter as _TinyEmitter } from 'tiny-emitter';
import * as immutable from 'object-path-immutable';

export const deepCopy = v => JSON.parse(JSON.stringify(v));

// https://stackoverflow.com/questions/23104582/scaling-an-image-to-fit-on-canvas
export function drawImageScaled(img, ctx) {
    var canvas = ctx.canvas;
    var hRatio = canvas.width / img.width;
    var vRatio = canvas.height / img.height;
    var ratio = Math.max(hRatio, vRatio);
    var centerShift_x = (canvas.width - img.width * ratio) / 2;
    var centerShift_y = (canvas.height - img.height * ratio) / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, img.width, img.height,
        centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
}

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
    TRANSFORM_PLACEHOLDER_ELEMENT_STYLE: 'TRANSFORM_PLACEHOLDER_ELEMENT_STYLE',
    TRANSFORM_PLACEHOLDER_ELEMENT_MIRROR: 'TRANSFORM_PLACEHOLDER_ELEMENT_MIRROR',
    TOOLBOX_APPLY: 'TOOLBOX_APPLY',
    CLIPBOARD_COPY: 'CLIPBOARD_COPY',
    LOADING: 'LOADING',
    LOADING_FINISH: 'LOADING_FINISH'
};

export const TinyEmitter = new _TinyEmitter();

