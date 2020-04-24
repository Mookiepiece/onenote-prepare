import { Editor, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { useState } from 'react';

const LIST_TYPES = ['numbered-list', 'bulleted-list'];

const DEFAULT_KEY_MAP = new Map([
    ['align', 'left'],
]);

export const toggleBlock = (editor, key, value) => {
    if (key === "type") { // types are just <pre> or <li>
        const isActive = isBlockActive(editor, key, value);
        const isList = LIST_TYPES.includes(value);

        // unwrap the ol/ul first
        Transforms.unwrapNodes(editor, {
            match: n => LIST_TYPES.includes(n.type),
            split: true,
        });

        // switch to p or li
        Transforms.setNodes(editor, {
            type: isActive ? 'paragraph' : isList ? 'list-item' : value,
            match: ({ type }) => type === 'list-item' || type === 'paragraph'
        });

        // wrap li with ol/ul
        if (!isActive && isList) {
            const listBlock = { type: value, children: [] };

            // NOTE: Transforms.wrapNodes will always wrap the biggest user selection even if match:type==='li' is settled
            // that way in tables, we will get td/tr wrapped by ul/ol and cause error
            for (let [_, path] of Editor.nodes(editor, { at: editor.selection, match: ({ type }) => type === 'list-item' })) {
                Transforms.wrapNodes(editor, listBlock, { at: path });
            }
        }
    } else { // tabs, align, 
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