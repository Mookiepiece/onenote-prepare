import React, { useCallback, useMemo, useState } from 'react';
import isHotkey from 'is-hotkey';
import { Editable, withReact, useSlate, Slate } from 'slate-react';
import { Editor, Transforms, createEditor } from 'slate';
import { withHistory } from 'slate-history';
import {
    BoldOutlined,
    ItalicOutlined,
    UnderlineOutlined,
    CodeOutlined,
    FontSizeOutlined,
    ContainerOutlined,
    OrderedListOutlined,
    UnorderedListOutlined
} from '@ant-design/icons';

import './style.scss';

// const withPreOneNote=(editor:Editor)=>{
//     editor.isInline=
// }

const Workbench = () => {
    const [value, setValue] = useState(initialValue);
    const renderElement = useCallback(props => <Element {...props} />, []);
    const renderLeaf = useCallback(props => <Leaf {...props} />, []);
    const editor = useMemo(() => withHistory(withReact(createEditor())), []);

    return (
        <>
            <div className="workbench">
                <div>

                    <Slate editor={editor} value={value} onChange={value => setValue(value)}>
                        <Toolbar />
                        <Editable
                            renderElement={renderElement}
                            renderLeaf={renderLeaf}
                            placeholder="Enter some rich text…"
                            spellCheck
                            autoFocus
                            onKeyDown={event => {
                                for (const hotkey in HOTKEYS) {
                                    if (isHotkey(hotkey, event)) {
                                        event.preventDefault()
                                        const mark = HOTKEYS[hotkey]
                                        toggleMark(editor, mark)
                                    }
                                }
                            }}
                        />
                    </Slate>
                    <p>{JSON.stringify(value)}</p>
                </div>
                <aside>

                </aside>
            </div>
        </>
    )
}

const HOTKEYS = {
    'mod+b': 'bold',
    'mod+i': 'italic',
    'mod+u': 'underline',
    'mod+`': 'code',
};

const LIST_TYPES = ['numbered-list', 'bulleted-list'];

const Toolbar = () => {
    let editor = useSlate();
    return (
        <div className="editor-toolbar">
            <MarkButton format="bold" icon={BoldOutlined} />
            <MarkButton format="italic" icon={ItalicOutlined} />
            <MarkButton format="underline" icon={UnderlineOutlined} />
            <MarkButton format="code" icon={CodeOutlined} />
            <Divider />
            <BlockButton format="heading-one" icon={FontSizeOutlined} />
            <BlockButton format="heading-two" icon={FontSizeOutlined} />
            <BlockButton format="block-quote" icon={ContainerOutlined} />
            <Divider />
            <BlockButton format="numbered-list" icon={OrderedListOutlined} />
            <BlockButton format="bulleted-list" icon={UnorderedListOutlined} />
        </div>
    );
};

const Divider = () => (<span className="divider"></span>)

const Leaf = ({ attributes, children, leaf }) => {

    if (leaf.bold) {
        children = <strong>{children}</strong>;
    }

    if (leaf.code) {
        children = <code>{children}</code>;
    }

    if (leaf.italic) {
        children = <em>{children}</em>;
    }

    if (leaf.underline) {
        children = <u>{children}</u>;
    }

    return <span {...attributes}>{children}</span>;
};

const Element = ({ attributes, children, element }) => {
    switch (element.type) {
        case 'block-quote':
            return <blockquote {...attributes}>{children}</blockquote>;
        case 'bulleted-list':
            return <ul {...attributes}>{children}</ul>;
        case 'heading-one':
            return <h1 {...attributes}>{children}</h1>;
        case 'heading-two':
            return <h2 {...attributes}>{children}</h2>;
        case 'list-item':
            return <li {...attributes}>{children}</li>;
        case 'numbered-list':
            return <ol {...attributes}>{children}</ol>;
        default:
            return <p {...attributes}>{children}</p>;
    }
};

const toggleBlock = (editor, format) => {
    const isActive = isBlockActive(editor, format);
    const isList = LIST_TYPES.includes(format);

    //无论什么情况，取消列表包装
    Transforms.unwrapNodes(editor, {
        match: n => LIST_TYPES.includes(n.type),
        split: true,
    });

    //列表更复杂：如果是列表，设置为li并用该列表（ol ul）包住（下一句）
    //否则是简单的换成p或者该format
    Transforms.setNodes(editor, {
        type: isActive ? 'paragraph' : isList ? 'list-item' : format,
    });

    if (!isActive && isList) {
        const block = { type: format, children: [] };
        Transforms.wrapNodes(editor, block);
    }
}

const toggleMark = (editor, format) => {
    const isActive = isMarkActive(editor, format);

    if (isActive) {
        Editor.removeMark(editor, format);
    } else {
        Editor.addMark(editor, format, true);
    }
}

const isBlockActive = (editor, format) => {
    const [match] = Editor.nodes(editor, {
        match: n => n.type === format,
    });
    return !!match;
}

//TODO:模拟OneNote行为：只有选择的节点全都符合条件才判定为符合
const isMarkActive = (editor, format) => {
    const [match] = Editor.nodes(editor, {
        match: n => n[format] === true,
        mode: 'all',
    });
    return !!match;
}

const BlockButton = ({ format, icon }) => {
    const editor = useSlate();
    const Icon = icon;
    const className = `editor-button ${isBlockActive(editor, format) ? 'editor-button-active' : ''}`;

    return (
        <button
            className={className}
            onMouseDown={event => {
                event.preventDefault();
                toggleBlock(editor, format);
            }}
        >
            <Icon />
        </button>
    );
}

const MarkButton = ({ format, icon }) => {
    const editor = useSlate();
    const Icon = icon;
    const className = `editor-button ${isMarkActive(editor, format) ? 'editor-button-active' : ''}`;

    return (
        <button
            className={className}
            onMouseDown={event => {
                event.preventDefault();
                toggleMark(editor, format);
            }}
        >
            <Icon />
        </button>
    );
}

const initialValue = [
    {
        type: 'paragraph',
        children: [
            { text: 'This is editable ' },
            { text: 'rich', bold: true },
            { text: ' text, ' },
            { text: 'much', italic: true },
            { text: ' better than a ' },
            { text: '<textarea>', code: true },
            { text: '!' },
        ],
    },
    {
        type: 'paragraph',
        children: [
            {
                text:
                    "Since it's rich text, you can do things like turn a selection of text ",
            },
            { text: 'bold', bold: true },
            {
                text:
                    ', or add a semantically rendered block quote in the middle of the page, like this:',
            },
        ],
    },
    {
        type: 'block-quote',
        children: [{ text: 'A wise quote.' }],
    },
    {
        type: 'paragraph',
        children: [{ text: 'Try it out for yourself!' }],
    },
]

export default Workbench