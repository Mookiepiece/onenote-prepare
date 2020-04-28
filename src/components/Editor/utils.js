import { Editor, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { useState } from 'react';

const DEFAULT_KEY_MAP = new Map([
    ['align', 'left'],
]);

export function matchType(...args) {
    const p = args.includes('paragraph');
    if (p) {
        // root node could be an editor object with much properties like 'operations' etc, dont know why
        // leaf text==='' when inline-block at the edge of an line
        return n => args.includes(n.type) || (n.text === undefined && n.type === undefined && n.operations === undefined)
    } else {
        return n => args.includes(n.type)
    }
}

export const toggleBlock = (editor, key, value) => {
    if (key === "type") { // types are just <pre> or <li>
        const isActive = isBlockActive(editor, key, value);

        // unwrap li first
        // NOTE: note that if we have an [ ul > li > [p, p] ] and our selection is in the 2nd p
        // if we unwrap ul/ol first we will get [ il > [p, p] ] and then [[li > p], p] 
        // in this way [ ul > [li > p, p] ] and then [[ul > li > p], p]
        Transforms.unwrapNodes(editor, {
            match: ({ type }) => type === 'list-item',
            split: true
        });
        // unwrap the ol/ul
        Transforms.unwrapNodes(editor, {
            match: matchType('numbered-list', 'bulleted-list'),
            split: true,
        });

        if (!isActive) {
            const index = getSelectionPathLength(editor);

            let matches = [...Editor.nodes(editor, { match: matchType('table', 'paragraph') })];
            matches = matches.filter(([n, { length }]) => length >= index); // remove nodes which outside our selection

            let m = matches.reduce((prev, [n, { length }]) => length < prev ? length : prev, Number.MAX_SAFE_INTEGER);
            matches = matches.filter(([n, { length }]) => length === m); // only save those nearest nodes inside our selection

            // NOTE: Transforms.wrapNodes will always wrap the biggest user selection even if match:type==='li' is settled
            // that way in tables, we will get td/tr wrapped by ul/ol and cause error
            // BUT in this way, every li is in a indivisual ol/ul, which is also not good
            for (let [node, path] of matches) {
                Transforms.wrapNodes(editor, { type: 'list-item', children: [] }, { at: path });
                Transforms.wrapNodes(editor, { type: value, children: [] }, { at: path });
            }
        }
    } else { //align 
        const isActive = isBlockActive(editor, key, value);
        Transforms.setNodes(editor, {
            [key]: isActive ? DEFAULT_KEY_MAP.get(key) : value,
        });
    }
}

const getSelectionPathLength = (editor) => {
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
    return index;
}

export const toggleTabs = (editor, value) => {
    let index = getSelectionPathLength(editor);
    let matches = [...Editor.nodes(editor, { match: matchType('numbered-list', 'bulleted-list', 'table', 'paragraph') })];

    // we will find the 'list' node which contains our table/paragraph
    // if yes, index -=2, tabs will affect 'list' node instead
    const potentialListParentPath = editor.selection.anchor.path.slice(0, index - 2);
    if (potentialListParentPath.length > 0) {
        const match = Editor.node(editor, potentialListParentPath);
        if (match) {
            const [potentialListParentNode] = match;
            if (matchType('numbered-list', 'bulleted-list')(potentialListParentNode)) {
                index -= 2;
            }
        }
    }

    matches = matches.filter(([n, { length }]) => length >= index);

    let m = matches.reduce((prev, [n, { length }]) => length < prev ? length : prev, Number.MAX_SAFE_INTEGER);
    matches = matches.filter(([n, { length }]) => length === m);

    for (let [{ tabs }, path] of matches) {
        if (tabs === undefined) {
            Transforms.setNodes(editor, { tabs: Math.max(value, 0) }, { at: path, });
        } else {
            Transforms.setNodes(editor, { tabs: Math.max(tabs + value, 0) }, { at: path, });
        }
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
// lose focus
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