import { Editor, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { useState } from 'react';

const LIST_TYPES = ['numbered-list', 'bulleted-list'];

const DEFAULT_KEY_MAP = new Map([
    ['align', 'left'],
]);

export const toggleBlock = (editor, key, value) => {
    if (key === "type") {
        const isActive = isBlockActive(editor, key, value);
        const isList = LIST_TYPES.includes(value);

        // 无论什么情况，取消列表包装
        Transforms.unwrapNodes(editor, {
            match: n => LIST_TYPES.includes(n.type),
            split: true,
        });

        // 列表的情况更复杂：如果是列表，设置为li并用该列表（ol ul）包住（下一句）
        // 否则是简单的换成p或者该value
        Transforms.setNodes(editor, {
            type: isActive ? 'paragraph' : isList ? 'list-item' : value,
        });

        if (!isActive && isList) {
            const block = { type: value, children: [] };
            Transforms.wrapNodes(editor, block);
        }
    } else {
        const isActive = isBlockActive(editor, key, value);
        Transforms.setNodes(editor, {
            [key]: isActive ? DEFAULT_KEY_MAP.get(key) : value
        });
    }
}

export const toggleMark = (editor, key, value = true) => {
    const isActive = isMarkActive(editor, key, value);
    if (isActive) {
        Editor.removeMark(editor, key);
    } else {
        Editor.addMark(editor, key, value);
    }
}

export const isBlockActive = (editor, key, value) => {
    const [match] = Editor.nodes(editor, {
        match: n => n[key] === value,
    });
    return !!match;
}

export const getElement = (editor) => {
    const matches = [...Editor.nodes(editor, {
        match: n => !!n.children,
        mode: 'lowest'
    })];
    if (matches && matches[0]) {
        const [[node]] = matches;
        return node;
    }
    return null;
}

export const isMarkActive = (editor, key, value = true) => {
    const [match] = Editor.nodes(editor, {
        match: n => n[key] === value,
        mode: 'all',
    });
    return !!match;
}

/**
 * for font
 */
export const getMarkActiveSet = (editor, value) => {
    //遍历顺序是从根到内一直到选中区域，并将所有节点放进此列表
    const set = Editor.nodes(editor, {
        match: n => n.text !== undefined,
    });
    // no repeat
    return [...new Set([...set].map(v => v[0][value] === undefined ? '' : v[0][value]))];
}

// https://github.com/ianstormtaylor/slate/issues/3412
// no lose focus
let selection;
export const putSelection = editor => {
    selection = editor.selection;
    console.debug('put selection', selection);
}

export const getSelection = editor => {
    if (selection !== null) {
        ReactEditor.focus(editor);
        Transforms.select(editor, selection); //NOTE:setSelection不能即时生效，不明白setSelection和select的区别
        return true;
    }
    return false;
}

export const useSlateSelection = (editor) => {
    const [selection, setSelection] = useState(null);

    const putSelection = _ => setSelection(editor.selection);
    const getSelection = _ => {
        if (selection !== null) {
            ReactEditor.focus(editor);
            Transforms.select(editor, selection); //NOTE:setSelection不能即时生效，不明白setSelection和select的区别
        }
        return selection;
    }
    return [putSelection, getSelection];
}