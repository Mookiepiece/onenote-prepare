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

export const removeArrayItem = (array, index) => {
    return [
        ...array.slice(0, index),
        ...array.slice(index + 1, array.length)
    ]
}
