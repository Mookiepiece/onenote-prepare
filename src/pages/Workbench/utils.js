import { Editor, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';

const LIST_TYPES = ['numbered-list', 'bulleted-list'];

const DEFAULT_KEY_MAP = new Map([
    ['align', 'left'],
]);

export const toggleBlock = (editor, key, format) => {

    if (key === "type") {
        const isActive = isBlockActive(editor, key, format);
        const isList = LIST_TYPES.includes(format);

        //无论什么情况，取消列表包装
        Transforms.unwrapNodes(editor, {
            match: n => LIST_TYPES.includes(n.type),
            split: true,
        });

        //列表的情况更复杂：如果是列表，设置为li并用该列表（ol ul）包住（下一句）
        //否则是简单的换成p或者该format
        Transforms.setNodes(editor, {
            type: isActive ? 'paragraph' : isList ? 'list-item' : format,
        });

        if (!isActive && isList) {
            const block = { type: format, children: [] };
            Transforms.wrapNodes(editor, block);
        }
    } else {
        const isActive = isBlockActive(editor, key, format);
        Transforms.setNodes(editor, {
            [key]: isActive ? DEFAULT_KEY_MAP.get(key) : format
        });
    }

}

export const toggleMark = (editor, format, value = true) => {
    const isActive = isMarkActive(editor, format, value);
    if (isActive) {
        Editor.removeMark(editor, format);
    } else {
        Editor.addMark(editor, format, value);
    }
}

export const isBlockActive = (editor, key, format) => {
    const [match] = Editor.nodes(editor, {
        match: n => n[key] === format,
    });
    return !!match;
}

export const isMarkActive = (editor, format, value = true) => {
    const [match] = Editor.nodes(editor, {
        match: n => n[format] === value,
        mode: 'all',
    });
    return !!match;
}

export const getMarkActiveSet = (editor, format) => {
    //遍历顺序是从根到内一直到选中区域，并将所有节点放进此列表
    const set = Editor.nodes(editor, {
        match: n => n.text !== undefined,
    });
    // set 剔重
    return [...new Set([...set].map(v => v[0][format] === undefined ? '' : v[0][format]))];
}

//https://github.com/ianstormtaylor/slate/issues/3412
//失去焦点的解决方案
let selection;
export const putSelection = editor => {
    selection = editor.selection;
    console.debug(selection);
}

export const getSelection = editor => {
    if (selection !== null) {
        ReactEditor.focus(editor);
        Transforms.select(editor, selection); //NOTE:setSelection不能即时生效，不明白setSelection和select的区别
        return true;
    }
    return false;
}