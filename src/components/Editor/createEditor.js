import React, { useCallback, useMemo, useState } from 'react';
import { Editable, withReact, Slate } from 'slate-react';
import { createEditor as _createEditor, Range, Editor, Point, Transforms } from 'slate';
import { withHistory } from 'slate-history';

export const createEditor = () => withPlaceholders(withTables(withHistory(withReact(_createEditor()))));

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

const withPlaceholders = editor => {
    const { isInline, isVoid } = editor

    editor.isInline = element => {
        return element.type === 'bling-placeholder' ? true : isInline(element)
    }

    editor.isVoid = element => {
        return element.type === 'bling-placeholder' ? true : isVoid(element)
    }

    return editor
}

export const renderLeaf = props => <Leaf {...props} />;
const Leaf = ({ attributes, children, leaf }) => {
    let style = {};
    let className = '';

    if (leaf.bold) {
        style = { ...style, fontWeight: 700 };
    }

    if (leaf.italic) {
        style = { ...style, fontStyle: 'italic' };
    }

    if (leaf.underline) {
        style = { ...style, textDecorationLine: 'underline' };
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
        style = { ...style, fontSize: leaf.fontSize + 'pt' };
    }

    //matched text
    if (leaf.bling) {
        className += ' bling';
        leaf.bling % 2 && (className += ' odd')
    }

    return <span {...attributes} style={style} className={className ? className : null}>{children}</span>;
};

export const renderElement = props => <Element {...props} />;
const Element = ({ attributes, children, element }) => {

    let style = {};
    style = { ...style, textAlign: element.align ? element.align : null };

    attributes = { ...attributes, style }

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

        //placeholder
        case 'bling-placeholder':
            // switch (element.placeholderType) {
            //     case 'bling':
            //     }
            return (
                <div
                    className="bling-placeholder"
                    {...attributes}
                >
                    {children}
                </div>
            )

        default:
            return <pre {...attributes}>{children}</pre>;
    }
};
