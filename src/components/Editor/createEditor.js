import React, { useState } from 'react';
import { withReact, useSelected, useFocused, useSlate, ReactEditor } from 'slate-react';
import { createEditor as _createEditor, Range, Editor, Point, Transforms } from 'slate';
import { withHistory } from 'slate-history';

import { TinyEmitter, EVENTS } from '@/utils/index';
import { DropdownButtonSelect } from '@/components/DropdownButton';
import Button from '@/components/MkButton';

export const createEditor = () => withPlaceholders(withTablesLists(withHistory(withReact(_createEditor()))));
export const createNoHistoryEditor = () => withPlaceholders(withTablesLists(withReact(_createEditor())));

const withTablesLists = editor => {
    const { deleteBackward, deleteForward, insertBreak, normalizeNode } = editor;

    // editor.insertBreak = 

    editor.deleteBackward = unit => {
        const { selection } = editor;

        if (selection && Range.isCollapsed(selection)) {
            const [cell] = Editor.nodes(editor, {
                match: n => n.type === 'table-cell',
            });

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

    editor.normalizeNode = ([node, path]) => {
        if (node.type === 'table') { // 表格不准缺格漏格  tables like this ▛ will be fixed
            const rowMatches = [...Editor.nodes(editor, {
                at: path,
                match: node => node.type === 'table-row'
            })].filter(([node, rowPath]) => rowPath.length === path.length + 1);

            const cellMatches = [...Editor.nodes(editor, {
                at: path,
                match: node => node.type === 'table-cell'
            })].filter(([node, cellPath]) => cellPath.length === path.length + 2);

            const arr = [];

            let count = 1;
            cellMatches.forEach(([node, cellPath], i) => {
                if (cellPath[cellPath.length - 1] === 0) {
                    arr.push(count);
                    count = 1;
                } else {
                    count++;
                }
            });
            arr.push(count);
            arr.shift();

            const maxColCount = Math.max(...arr);
            arr.forEach((curColCount, i) => {
                let j = curColCount;
                while (j < maxColCount) {
                    Transforms.insertNodes(editor, [{ type: "table-cell", children: [{ type: 'paragraph', children: [{ text: '' }] }] }], {
                        at: [...rowMatches[i][1], j],
                    });
                    j++;
                }
            });
        }

        return normalizeNode([node, path])
    }

    // TODO: tables

    return editor
}

const withPlaceholders = editor => {
    const { isInline, isVoid } = editor

    editor.isInline = element => {
        return (
            element.type === 'bling-placeholder' ||
            element.type === 'transform-placeholder'
        ) ? true : isInline(element)
    }

    editor.isVoid = element => {
        return (
            element.type === 'bling-placeholder' ||
            element.type === 'transform-placeholder'
        ) ? true : isVoid(element)
    }

    return editor
}

// Transform Placeholder Element only occurs in ✨result✨ editor
// WARNING: I am going to TRANSFORM ⚠
const TransformPlaceholderElement = ({ attributes, children, element }) => {
    const editor = useSlate();
    const selected = useSelected();
    const focused = useFocused();

    const [active, setActive] = useState(false);

    const handleChange = value => {
        let [[node, path]] = Editor.nodes(editor, {
            match: n => n.type === "transform-placeholder",
            mode: 'all',
        });

        const { meta } = node

        switch (value) {
            case 'CLOSE':
                Transforms.removeNodes(editor, { at: path });
                break;
            case 'STYLE':
                TinyEmitter.emit(EVENTS.TRANSFORM_PLACEHOLDER_ELEMENT_STYLE, function callback(i, v) {
                    Transforms.setNodes(editor, {
                        meta: {
                            ...meta,
                            style: v.style,
                        }
                    }, {
                        at: path
                    });
                });
                break;
            case 'MIRROR':
                TinyEmitter.emit(EVENTS.TRANSFORM_PLACEHOLDER_ELEMENT_MIRROR, function callback(i) {
                    console.log(i)
                    Transforms.setNodes(editor, {
                        meta: {
                            ...meta,
                            mirror: i,
                        }
                    }, {
                        at: path
                    });
                });
                break;
            default:
                throw new Error('[Transform] nooo');
        }
    };

    return (
        <div
            className={`transform-placeholder ${selected && focused ? 'focused' : ''}`}
            {...attributes}
        >
            <DropdownButtonSelect
                value="原内容"
                active={active}
                setActive={setActive}
                options={[
                    { label: '样式', value: 'STYLE' },
                    { label: 'Tab切分', value: 'MIRROR' },
                    { label: '✘', value: 'CLOSE' },
                ]}
                onChange={handleChange}

                renderButton={ref => (
                    <Button
                        className={active ? '__dropdown dropdown-button' : "dropdown-button"}
                        ref={ref}
                        onMouseDown={event => {
                            event.preventDefault(); // slate.js
                            setActive(!active);
                        }}

                    >
                        <Leaf leaf={element.meta.style || {}}>{element.meta.mirror === 0 ? '原内容' : '切分内容-' + element.meta.mirror}</Leaf>
                    </Button>
                )}
            />
            {children}
        </div>
    )
}

export const renderLeaf = props => <Leaf {...props} />;
const Leaf = ({ attributes, children, leaf }) => {
    let [style, className] = computeLeafStyleAndClassName(leaf);

    return <span {...attributes} style={style} className={className ? className : null}>{children}</span>;
};

export const computeLeafStyleAndClassName = (leaf) => {
    let className = '';
    let style = {};
    if (leaf.bold) {
        style = { ...style, fontWeight: 'bold' };
    }
    if (leaf.italic) {
        style = { ...style, fontStyle: 'italic' };
    }
    if (leaf.underline) {
        style = { ...style, textDecorationLine: 'underline' };
    }
    if (leaf.strike) {
        style = { ...style, textDecorationLine: style.textDecorationLine ? style.textDecorationLine + ' line-through' : 'line-through' };
    }

    if (leaf.fontColor) {
        style = { ...style, color: leaf.fontColor };
    }
    if (leaf.bgColor) {
        style = { ...style, backgroundColor: leaf.bgColor };
    }
    if (leaf.fontFamily) {
        style = { ...style, fontFamily: leaf.fontFamily };
    } else {
        style = { ...style, fontFamily: 'var(--slate-default-font-family)' };
    }
    if (leaf.fontSize) {
        style = { ...style, fontSize: leaf.fontSize + 'pt' };
    } else {
        style = { ...style, fontSize: 'var(--slate-default-font-size)' };
    }

    // matched text ✨
    if (leaf.bling) {
        className += ' bling';
        leaf.bling % 2 && (className += ' odd')
    }

    return [style, className];
}

export const renderElement = props => <Element {...props} />;
const Element = (props) => {
    let { attributes, children, element } = props;

    let style = {
        '--tabs': `${0.375 * (element.tabs ? element.tabs : 0)}in`,
        textAlign: element.align ? element.align : null
    };

    let className = `${element.bling ? 'bling' : ''}`;

    attributes = { ...attributes, style, className };

    switch (element.type) {
        //richtext
        case 'block-quote':
            return <blockquote {...attributes}>{children}</blockquote>;
        case 'heading-one':
            return <h1 {...attributes}>{children}</h1>;
        case 'heading-two':
            return <h2 {...attributes}>{children}</h2>;
        case 'bulleted-list':
            return <ul {...attributes}>{children}</ul>;
        case 'numbered-list':
            return <ol {...attributes}>{children}</ol>;
        case 'list-item':
            return <li {...attributes}>{children}</li>;
        //table
        case 'table':
            if (element.noBorder) {
                attributes.className += ' no-border';
            }
            return (
                <table {...attributes}>
                    <tbody>{children}</tbody>
                </table>
            )
        case 'table-row':
            return <tr {...attributes}>{children}</tr>
        case 'table-cell':
            attributes.style = { ...attributes.style, background: element.cellColor };
            return <td {...attributes}>{children}</td>

        //placeholder
        case 'bling-placeholder':
            attributes.className += ' bling-placeholder';
            return (
                <div
                    {...attributes}
                >
                    {children}
                </div>
            )
        case 'transform-placeholder':
            return <TransformPlaceholderElement {...props} />

        default:
            return <pre {...attributes}>{children}</pre>;
    }
};
