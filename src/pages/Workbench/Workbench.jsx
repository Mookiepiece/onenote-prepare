import React, { useCallback, useMemo, useState } from 'react';
import { Editable, withReact, Slate } from 'slate-react';
import { createEditor, Range, Editor, Point, Transforms } from 'slate';
import { withHistory } from 'slate-history';
import './style.scss';

import {
    higherOrderKeydownHandler,
    Toolbar
} from './components/tools';
import Aside from './components/Aside';

const Workbench = () => {
    const [value, setValue] = useState(initialValue);
    const renderElement = useCallback(props => <Element {...props} />, []);
    const renderLeaf = useCallback(props => <Leaf {...props} />, []);
    const editor = useMemo(() => withTables(withHistory(withReact(createEditor()))), []);
    const handleKeydown = event => higherOrderKeydownHandler(editor)(event);

    return (
        <>
            <div className="workbench">
                <div className="slate">
                    <Slate editor={editor} value={value} onChange={value => setValue(value)}>
                        <Toolbar />
                        <Editable
                            id="__SLATE_CONTENT"
                            renderElement={renderElement}
                            renderLeaf={renderLeaf}
                            placeholder="Enter some rich text…"
                            onKeyDown={handleKeydown}
                        />
                    </Slate>
                    <p>{JSON.stringify(value)}</p>
                </div>
                <Aside />
            </div>
        </>
    )
}
const withTables = editor => {
    const { deleteBackward, deleteForward, insertBreak } = editor

    editor.deleteBackward = unit => {
        const { selection } = editor

        if (selection && Range.isCollapsed(selection)) {
            const [cell] = Editor.nodes(editor, {
                match: n => n.type === 'table-cell',
            })

            if (cell) {
                const [, cellPath] = cell;
                const start = Editor.start(editor, cellPath);
                const end = Editor.end(editor, cellPath);
                if (Point.equals(selection.anchor, start)) {
                    //cursor was positioned in both start and end, means no text inside, move to prev cell
                    if (Point.equals(selection.anchor, end)) {
                        Transforms.move(editor, { reverse: true });
                        return;
                    }
                    return;
                }
            }
        }

        deleteBackward(unit)
    }

    editor.deleteForward = unit => {
        const { selection } = editor

        if (selection && Range.isCollapsed(selection)) {
            const [cell] = Editor.nodes(editor, {
                match: n => n.type === 'table-cell',
            })

            if (cell) {
                const [, cellPath] = cell;
                const start = Editor.start(editor, cellPath);
                const end = Editor.end(editor, cellPath);
                if (Point.equals(selection.anchor, end)) {
                    if (Point.equals(selection.anchor, start)) {
                        Transforms.move(editor);
                        return;
                    }
                    return;
                }
            }
        }

        deleteForward(unit)
    }

    // editor.insertBreak = () => {
    //     const { selection } = editor

    //     if (selection) {
    //         const [table] = Editor.nodes(editor, { match: n => n.type === 'table' })

    //         if (table) {
    //             return
    //         }
    //     }

    //     insertBreak()
    // }

    return editor
}

const Leaf = ({ attributes, children, leaf }) => {
    let style = {};

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

    if (leaf.fontColor) {
        style = { ...style, color: leaf.fontColor };
    }
    if (leaf.bgColor) {
        style = { ...style, backgroundColor: leaf.bgColor };
    }
    if (leaf.fontFamily) {
        style = { ...style, fontFamily: leaf.fontFamily };
    }
    if (leaf.fontSize) {
        style = { ...style, fontSize: leaf.fontSize };
    }

    return <span {...attributes} style={style}>{children}</span>;
};

const Element = ({ attributes, children, element }) => {
    switch (element.type) {
        //richtext
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
        //table
        case 'table':
            return (
                <table>
                    <tbody {...attributes}>{children}</tbody>
                </table>
            )
        case 'table-row':
            return <tr {...attributes}>{children}</tr>
        case 'table-cell':
            return <td {...attributes}>{children}</td>
        default:
            return <p {...attributes}>{children}</p>;
    }
};

const initialValue = [
    {
        children: [
            {
                fontFamily: '等线',
                fontSize: 16,
                text:
                    'Since the editor is based on a recursive tree model, similar to an HTML document, you can create complex nested structures, like tables:',
            },
        ],
    },
    {
        type: 'table',
        children: [
            {
                type: 'table-row',
                children: [
                    {
                        type: 'table-cell',
                        children: [
                            {
                                type: 'paragraph',
                                children: [
                                    {
                                        fontFamily: '等线',
                                        fontSize: 16,
                                        text: 'haha',
                                        bold: true
                                    }]
                            }
                        ],
                    },
                    {
                        type: 'table-cell',
                        children: [
                            {
                                type: 'paragraph',
                                children: [{
                                    fontFamily: '等线',
                                    fontSize: 16,
                                    text: 'wawa',
                                    bold: true
                                }]
                            }
                        ],
                    },
                    {
                        type: 'table-cell',
                        children: [
                            {
                                type: 'paragraph',
                                children: [{
                                    fontFamily: '微软雅黑',
                                    fontSize:20,
                                    text: 'wawa',
                                    bold: true
                                }]
                            }
                        ],
                    },
                    {
                        type: 'table-cell',
                        children: [
                            {
                                type: 'paragraph',
                                children: [{ text: 'wawa', bold: true }]
                            }
                        ],
                    },
                ],
            },
            {
                type: 'table-row',
                children: [
                    {
                        type: 'table-cell',
                        children: [
                            {
                                type: 'paragraph',
                                children: [{ text: 'wawa', bold: true }]
                            }
                        ],
                    },
                    {
                        type: 'table-cell',
                        children: [
                            {
                                type: 'paragraph',
                                children: [{ text: 'wawa', bold: true }]
                            }
                        ],
                    },
                    {
                        type: 'table-cell',
                        children: [
                            {
                                type: 'paragraph',
                                children: [{ text: 'wawa', bold: true }]
                            }
                        ],
                    },
                    {
                        type: 'table-cell',
                        children: [
                            {
                                type: 'paragraph',
                                children: [{ text: 'wawa', bold: true }]
                            }
                        ],
                    },
                ],
            },
            {
                type: 'table-row',
                children: [
                    {
                        type: 'table-cell',
                        children: [{ text: '# of Lives', bold: true }],
                    },
                    {
                        type: 'table-cell',
                        children: [
                            {
                                type: 'paragraph',
                                children: [{ text: 'wawa', bold: true }]
                            }
                        ],
                    },
                    {
                        type: 'table-cell',
                        children: [
                            {
                                type: 'paragraph',
                                children: [{ text: 'wawa', bold: true }]
                            }
                        ],
                    },
                    {
                        type: 'table-cell',
                        children: [
                            {
                                type: 'paragraph',
                                children: [{ text: 'wawa', bold: true }]
                            }
                        ],
                    },
                ],
            },
        ],
    },
    {
        children: [
            {
                text:
                    "This table is just a basic example of rendering a table, and it doesn't have fancy functionality. But you could augment it to add support for navigating with arrow keys, displaying table headers, adding column and rows, or even formulas if you wanted to get really crazy!",
            },
        ],
    },
];

export default Workbench