import { Editor, Transforms, Range, Path } from 'slate';
import { ReactEditor } from 'slate-react';
import { useState } from 'react';

const DEFAULT_KEY_MAP = new Map([
    ['align', 'left'],
]);

const isParagraph = (node) => {
    // root node could be an editor object with much properties, dont know why
    return ((node.text === undefined && (node.type === undefined)) || node.type === 'paragraph') && node.operations === undefined
}

export const toggleBlock = (editor, key, value) => {
    if (key === "type") { // types are just <pre> or <li>
        const isActive = isBlockActive(editor, key, value);

        // unwrap the ol/ul first
        Transforms.unwrapNodes(editor, {
            match: n => ['numbered-list', 'bulleted-list'].includes(n.type),
            split: true,
        });
        Transforms.unwrapNodes(editor, {
            match: ({ type }) => type === 'list-item',
            split: true
        });

        if (!isActive) {
            let { anchor: { path: p0 }, focus: { path: p1 } } = editor.selection;
            if (p0.length > p1.length) [p0, p1] = [p1, p0];

            // the first index of anchorPath & focusPath become different
            // which represents the nearest Path that contains the whole selection
            let index = 0;
            for (; index < p1.length; index++) {
                if (p1[index] !== p0[index]) {
                    break;
                }
            }
            if (index === p1.length) index = p1.length - 1;
            const listBlock = { type: value, children: [] };
            let matches = [...Editor.nodes(editor, { at: editor.selection, match: n => n.type === 'table' || isParagraph(n) })];
            matches = matches.filter(([n, { length }]) => length >= index); // filter nodes which outside our selection

            if (matches[0]) {
                let m = matches.reduce((prev, [n, { length }]) => length < prev ? length : prev, Number.MAX_SAFE_INTEGER);
                matches = matches.filter(([n, { length }]) => length === m); // only save those nearest nodes inside our selection
            }


            // NOTE: Transforms.wrapNodes will always wrap the biggest user selection even if match:type==='li' is settled
            // that way in tables, we will get td/tr wrapped by ul/ol and cause error
            // TODO: BUT in this way, every li is in a indivisual ol/ul, which is bad
            for (let [node, path] of matches) {
                console.log(node, path);
                Transforms.wrapNodes(editor, { type: 'list-item', children: [] }, { at: path });
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