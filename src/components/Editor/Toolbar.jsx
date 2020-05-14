import React, { useState, useEffect, useCallback } from 'react';
import { useSlate, DefaultElement, ReactEditor } from 'slate-react';
import { Editor, Transforms, Range, Text, Path, Location, Point } from 'slate';
import { SketchPicker } from 'react-color';

import { DropdownButton, DropdownButtonSelect } from '@/components/DropdownButton';
import Button from '@/components/MkButton';

import {
    BoldOutlined,
    ItalicOutlined,
    UnderlineOutlined,
    FontSizeOutlined,
    ContainerOutlined,
    StrikethroughOutlined,
    OrderedListOutlined,
    UnorderedListOutlined,
    CaretRightOutlined,
    FontColorsOutlined,
    BgColorsOutlined,
    SwapRightOutlined,
    AlignLeftOutlined,
    AlignCenterOutlined,
    AlignRightOutlined,
    TableOutlined,
    InsertRowAboveOutlined,
    InsertRowBelowOutlined,
    InsertRowLeftOutlined,
    InsertRowRightOutlined,
    DeleteColumnOutlined,
    DeleteRowOutlined,
    CreditCardOutlined,
    BorderlessTableOutlined,
    StarOutlined,
    ClearOutlined,
    DeleteOutlined
} from '@ant-design/icons';

import { toggleBlock, toggleMark, isMarkActive, isBlockActive, getMarkActiveSet, putSelection, getSelection } from './utils';

import { fontSizeOptions, fontFamilyOptions, SLATE_DEFAULTS } from '@/utils/userSettings';
import StylePickerDialog from './StylePickerDialog';
import TableStylePickerDialog from './TableStylePickerDialog';

const Toolbar = ({ readOnly }) => {

    return (
        <div className={`editor-toolbar${readOnly ? ' editor-toolbar-disabled' : ''}`}>
            <div className="toolbar-group">
                <FontComponent />
                <FontSizeComponent />
            </div>
            {/* <div className="toolbar-group">

                <BlockButton format="heading-one" icon={FontSizeOutlined} />
                <BlockButton format="heading-two" icon={FontSizeOutlined} />
                <BlockButton format="block-quote" icon={ContainerOutlined} />
            </div> */}
            <div className="toolbar-group">
                <BlockButton format="numbered-list" icon={OrderedListOutlined} />
                <BlockButton format="bulleted-list" icon={UnorderedListOutlined} />
            </div>
            <div className="toolbar-group">
                <BlockButton formatKey="align" format="left" icon={AlignLeftOutlined} />
                <BlockButton formatKey="align" format="center" icon={AlignCenterOutlined} />
                <BlockButton formatKey="align" format="right" icon={AlignRightOutlined} />
            </div>
            <div className="toolbar-group">
                <TableButton />
                <TableButtonGroup />
                <TableBorderButton />
            </div>
            <div className="toolbar-group">
                <MarkButton format="bold" icon={BoldOutlined} />
                <MarkButton format="italic" icon={ItalicOutlined} />
                <MarkButton format="underline" icon={UnderlineOutlined} />
                <MarkButton format="strike" icon={StrikethroughOutlined} />
            </div>
            <div className="toolbar-group">
                <ColorButton
                    format="fontColor"
                    icon={FontColorsOutlined}
                />
                <ColorButton
                    format="bgColor"
                    icon={BgColorsOutlined}
                />
                <TableColorButton />
            </div>
            <div className="toolbar-group">
                <LeafStyleButton />
                <TableStyleButton />
                <ActionButton />
                <ActionButtonX />
                <DeleteButton />
            </div>
        </div>
    );
};

const DeleteButton = () => {
    const editor = useSlate();
    return (
        <Button
            className="editor-button"
            onMouseDown={
                event => {
                    event.preventDefault();
                    for (let i = editor.children.length - 1; i > 0; i--) {
                        Transforms.delete(editor, { at: [i] });
                    }
                    Transforms.insertNodes(editor, { type: 'paragraph', children: [{ text: '' }] }, { at: [0] })
                    Transforms.delete(editor, { at: [1] });
                }
            }
        >
            <DeleteOutlined />
        </Button>
    )
}

const BlockButton = ({ formatKey = "type", format, icon }) => {
    const editor = useSlate();
    const Icon = icon;
    return (
        <Button
            className="editor-button"
            onMouseDown={event => {
                event.preventDefault();
                toggleBlock(editor, formatKey, format);
            }}
            active={isBlockActive(editor, formatKey, format)}
        >
            <Icon />
        </Button>
    );
}

const MarkButton = ({ format, icon }) => {
    const editor = useSlate();
    const Icon = icon;

    return (
        <Button
            className="editor-button"
            onMouseDown={event => {
                event.preventDefault();
                toggleMark(editor, format);
            }}
            active={isMarkActive(editor, format)}
        >
            <Icon />
        </Button>
    );
}

const TableButton = () => {
    const editor = useSlate();
    return (
        <Button
            className="editor-button"
            onMouseDown={
                event => {
                    event.preventDefault();
                    // TODO: if(Range.isCollapsed(editor.selection)){ 
                    Transforms.wrapNodes(editor, { type: 'table', children: [] });
                    Transforms.wrapNodes(editor, { type: 'table-row', children: [] });
                    Transforms.wrapNodes(editor, { type: 'table-cell', children: [] });
                }
            }
        >
            <TableOutlined />
        </Button>
    )
}

const getInsertRowHandlers = (editor, match) => {
    const [tableNode, tablePath] = match;

    const rows = [...Editor.nodes(editor, {
        at: tablePath,
        match: n => n.type === 'table-row'
    })].filter(([_, path]) => path.length - tablePath.length === 1);

    const cells = [...Editor.nodes(editor, {
        at: tablePath,
        match: n => n.type === 'table-cell'
    })].filter(([_, path]) => path.length - tablePath.length === 2);

    let colsCount = cells.length / rows.length;

    // ▔👆
    const insertRowAbove = () => {
        Transforms.insertNodes(editor, [{
            type: 'table-row', children: [...Array(colsCount).keys()].map(_ => ({
                type: 'table-cell', children: [{ type: 'paragraph', children: [{ text: '' }] }]
            }))
        }], {
            at: editor.selection.anchor.path.slice(0, tablePath.length + 1)
        });
    };

    // ▁👇
    const insertRowBelow = () => {
        Transforms.insertNodes(editor, [{
            type: 'table-row', children: [...Array(colsCount).keys()].map(_ => ({
                type: 'table-cell', children: [{ type: 'paragraph', children: [{ text: '' }] }]
            }))
        }], {
            at: [...tablePath, editor.selection.anchor.path[tablePath.length] + 1]
        });
    }

    // ▏👈
    const insertRowLeft = () => {
        //insert new col to the end(with the help of normalize)
        Transforms.insertNodes(editor, [{
            type: 'table-cell', children: [{ type: 'paragraph', children: [{ text: '' }] }]
        }], {
            at: [...tablePath, 0, colsCount]
        });

        //then move next to the current column
        let curCol = editor.selection.anchor.path[tablePath.length + 1];
        rows.forEach(([_, rowPath]) => {
            Transforms.moveNodes(editor, {
                at: [...rowPath, colsCount],
                to: [...rowPath, curCol]
            });
        });
    };

    // 👉▕
    const insertRowRight = () => {
        //insert new col to the end(with the help of normalize)
        Transforms.insertNodes(editor, [{
            type: 'table-cell', children: [{ type: 'paragraph', children: [{ text: '' }] }]
        }], {
            at: [...tablePath, 0, colsCount]
        });

        //then move next to the current column
        let curCol = editor.selection.anchor.path[tablePath.length + 1] + 1;
        rows.forEach(([_, rowPath]) => {
            Transforms.moveNodes(editor, {
                at: [...rowPath, colsCount],
                to: [...rowPath, curCol]
            });
        });
    };

    // | ❎
    const deleteColumn = () => {
        if (colsCount === 1) { // delete this table
            Transforms.insertNodes(editor, [{ type: 'paragraph', children: [{ text: '' }] }], { at: tablePath });
            Transforms.removeNodes(editor, { at: Path.next(tablePath) });
        } else {
            let curCol = editor.selection.anchor.path[tablePath.length + 1];
            rows.forEach(([_, rowPath]) => {
                Transforms.setNodes(editor, { '🖤': true }, { at: [...rowPath, curCol], });
            });
            Transforms.removeNodes(editor, { at: tablePath, match: ({ '🖤': v }) => v });
        }
    };

    // — ❎
    const deleteRow = () => {
        if (rows.length === 1) {
            Transforms.insertNodes(editor, [{ type: 'paragraph', children: [{ text: '' }] }], { at: tablePath });
            Transforms.removeNodes(editor, { at: Path.next(tablePath) });
        } else {
            Transforms.removeNodes(editor, { at: editor.selection.anchor.path.slice(0, tablePath.length + 1) });
        }
    };

    return [insertRowAbove, insertRowBelow, insertRowLeft, insertRowRight, deleteColumn, deleteRow];
}

const TableButtonGroup = () => {
    const editor = useSlate();

    const matches = [...Editor.nodes(editor, {
        match: n => n.type === 'table',
        mode: 'lowest'
    })];

    const disabled = matches.length === 0;
    const match = matches[0];

    return (
        <>
            <Button
                className="editor-button"
                disabled={disabled}
                onMouseDown={
                    event => {
                        event.preventDefault();
                        let [insertRowAbove, insertRowBelow, insertRowLeft, insertRowRight] = getInsertRowHandlers(editor, match);
                        insertRowAbove && insertRowAbove();
                    }
                }
            >
                <InsertRowAboveOutlined />
            </Button>
            <Button
                className="editor-button"
                disabled={disabled}
                onMouseDown={
                    event => {
                        event.preventDefault();
                        let [insertRowAbove, insertRowBelow, insertRowLeft, insertRowRight] = getInsertRowHandlers(editor, match);
                        insertRowBelow && insertRowBelow();
                    }
                }
            >
                <InsertRowBelowOutlined />
            </Button>
            <Button
                className="editor-button"
                disabled={disabled}
                onMouseDown={
                    event => {
                        event.preventDefault();
                        let [insertRowAbove, insertRowBelow, insertRowLeft, insertRowRight] = getInsertRowHandlers(editor, match);
                        insertRowLeft && insertRowLeft();
                    }
                }
            >
                <InsertRowLeftOutlined />
            </Button>
            <Button
                className="editor-button"
                disabled={disabled}
                onMouseDown={
                    event => {
                        event.preventDefault();
                        let [insertRowAbove, insertRowBelow, insertRowLeft, insertRowRight] = getInsertRowHandlers(editor, match);
                        insertRowRight && insertRowRight();
                    }
                }
            >
                <InsertRowRightOutlined />
            </Button>
            <Button
                className="editor-button"
                disabled={disabled}
                onMouseDown={
                    event => {
                        event.preventDefault();
                        let [insertRowAbove, insertRowBelow, insertRowLeft, insertRowRight, deleteColumn] = getInsertRowHandlers(editor, match);
                        deleteColumn && deleteColumn();
                    }
                }
            >
                <DeleteColumnOutlined />
            </Button>
            <Button
                className="editor-button"
                disabled={disabled}
                onMouseDown={
                    event => {
                        event.preventDefault();
                        let [insertRowAbove, insertRowBelow, insertRowLeft, insertRowRight, deleteColumn, deleteRow] = getInsertRowHandlers(editor, match);
                        deleteRow && deleteRow();
                    }
                }
            >
                <DeleteRowOutlined />
            </Button>
        </>
    )
}

// NOTE: Editor.nodes(editor,{at}), the 'at' option means all nodes lays on the way from outer to that 'at' path and all nodes inside 'at'

const ActionButton = () => {
    const editor = useSlate();
    return (
        <Button
            className="editor-button"
            onMouseDown={
                event => {
                    event.preventDefault();
                    // getSelection(editor);
                }
            }
        >
            <CaretRightOutlined />
        </Button >
    )
}

//NOTE:Transform.insertNodes如果给的是point是不会删除内容，给range会删除range里的内容
//如果range给的小也没问题

const ActionButtonX = () => {
    const editor = useSlate();
    return (
        <Button
            className="editor-button"
            onMouseDown={
                event => {
                    event.preventDefault();
                    putSelection(editor);

                }
            }
        >
            <CaretRightOutlined />
        </Button>
    )
}

const ColorButton = ({ format, icon }) => {
    const editor = useSlate();
    const [pickerActive, setPickerActive] = useState(false);
    const [color, setColor] = useState('#f90');

    const Icon = icon;

    return (
        <>
            <Button
                className="editor-button editor-button-color"
                active={isMarkActive(editor, format, color)}
                onMouseDown={event => {
                    event.preventDefault();
                    toggleMark(editor, format, color);
                    setPickerActive(false);
                }}>
                <div style={{ background: color }}></div>
                <Icon />
            </Button>

            <DropdownButton
                trigger='mousedown'
                active={pickerActive}
                setActive={v => {
                    setPickerActive(v);
                    if (v === false) {
                        getSelection(editor);
                        toggleMark(editor, format, color);
                    }
                }}

                renderButton={
                    (buttonRef) => {
                        return (
                            <Button
                                className={`editor-button editor-button-color-r ${pickerActive ? "__dropdown" : ""}`}
                                active={pickerActive}
                                onMouseDown={event => {
                                    event.preventDefault();
                                    if (!pickerActive) {
                                        putSelection(editor);
                                    }
                                    setPickerActive(!pickerActive);
                                }}
                                ref={buttonRef}
                            >
                                <SwapRightOutlined />
                            </Button>
                        )
                    }
                }

                renderDropdown={
                    (setPickerActive) => {
                        return (
                            <div>
                                <SketchPicker
                                    color={color}
                                    onChange={({ hex }) => setColor(hex)}
                                />
                            </div>
                        )
                    }
                }
            />
        </>
    )
}

const LeafStyleButton = () => {
    const editor = useSlate();
    const [stylePickerDialogVisible, setStylePickerDialogVisible] = useState(false);

    return (
        <>
            <Button
                className="editor-button"
                onMouseDown={event => {
                    event.preventDefault();
                    putSelection(editor);
                    setStylePickerDialogVisible(true);
                }}
            >
                <FontSizeOutlined />
            </Button>
            <StylePickerDialog
                onApply={(_, { style }) => {
                    const selection = getSelection(editor);
                    if (Range.isCollapsed(selection)) {
                        Transforms.setNodes(editor, style, { match: Text.isText })
                    } else {
                        for (let key in style) {
                            Editor.addMark(editor, key, style[key]);
                        }
                    }
                }}
                visible={stylePickerDialogVisible}
                setVisible={setStylePickerDialogVisible}
            />
        </>
    )
}

export const computeStyleTable = (computedRules, r, c) => {
    const table = Array(r).fill(c).map(c => Array(c).fill(0).map(_ => ({ cellColor: null, style: null })));

    function celli(cell, cellColor, style) {
        if (cell.cellColor === null) cell.cellColor = cellColor;
        if (cell.style === null) cell.style = style;
    }
    function all(cellColor, style) {
        table.forEach(r => r.forEach(cell => celli(cell, cellColor, style)));
    }

    for (let { target, cellColor, style } of computedRules) {
        switch (target[0]) {
            case 'row':
                if (target[2] === 0) {
                    all(cellColor, style);
                } else if (target[2] === 1) {
                    let j = target[1] - 1;
                    table.forEach((r, i) => {
                        if (i % 2 === j % 2)
                            r.forEach(cell => celli(cell, cellColor, style))
                    });
                } else {
                    let j = target[1] - 1;
                    table[j] && (table[j].forEach(cell => celli(cell, cellColor, style)));
                }
                break;
            case 'col':
                if (target[2] === 0) {
                    all(cellColor, style);
                } else if (target[2] === 1) {
                    let j = target[1] - 1;
                    table.forEach(r => r.forEach((cell, i) => {
                        if (i % 2 === j % 2)
                            celli(cell, cellColor, style);
                    }));
                } else {
                    let j = target[1] - 1;
                    table.forEach(r => r.forEach((cell, i) => i === j && celli(cell, cellColor, style)));
                }
                break;
            case 'cell':
                let i = target[1] - 1, j = target[2] - 1;
                table[i] && table[i][j] && celli(table[i][j], cellColor, style);
                break;
        }
    }

    return table;
}

const TableStyleButton = () => {
    const editor = useSlate();
    const [stylePickerDialogVisible, setStylePickerDialogVisible] = useState(false);

    const matches = [...Editor.nodes(editor, {
        match: n => n.type === 'table',
        mode: 'lowest'
    })];

    const disabled = matches.length === 0;

    return (
        <>
            <Button
                className="editor-button"
                disabled={disabled}
                onMouseDown={event => {
                    event.preventDefault();
                    putSelection(editor);
                    setStylePickerDialogVisible(true);
                }}
            >
                <CreditCardOutlined />
            </Button>
            <TableStylePickerDialog
                onApply={(_, { rules }) => {
                    const selection = getSelection(editor);
                    const [table, tablePath] = matches[0];
                    console.log("[debug]matches",matches);
                    let tableRows = table.children.length, tableCols = table.children[0].children.length;

                    const computedStyleTable = computeStyleTable(rules, tableRows, tableCols);

                    for (let i = 0; i < tableRows; i++) {
                        for (let j = 0; j < tableCols; j++) {
                            Transforms.setNodes(
                                editor,
                                { cellColor: computedStyleTable[i][j].cellColor },
                                { at: [...tablePath, i, j], }
                            )

                            // TODO: can transform leaf styles so difficult???
                            const cell = table.children[i].children[j];
                            for (let p = 0; p < cell.children.length; p++) {
                                const pre = cell.children[p];

                                for (let l = 0; l < pre.children.length; l++) {
                                    Transforms.setNodes(
                                        editor,
                                        computedStyleTable[i][j].style,
                                        {
                                            at: [...tablePath, i, j, p, l],
                                        }
                                    )
                                }
                            }

                        }
                    }
                }}
                visible={stylePickerDialogVisible}
                setVisible={setStylePickerDialogVisible}
            />
        </>
    )
}

const TableBorderButton = () => {
    const editor = useSlate();
    const matches = [...Editor.nodes(editor, {
        match: n => n.type === 'table',
        mode: 'lowest'
    })];

    const disabled = matches.length === 0;
    const [table, tablePath] = matches[0] || [];

    return (
        <>
            <Button
                disabled={disabled}
                className="editor-button"
                active={table && table.noBorder}
                onMouseDown={event => {
                    event.preventDefault();
                    Transforms.setNodes(editor, {
                        noBorder: !table.noBorder
                    }, {
                        at: tablePath
                    });
                }}>
                <BorderlessTableOutlined />
            </Button>
        </>
    )
}

const TableColorButton = () => {
    const editor = useSlate();
    const [pickerActive, setPickerActive] = useState(false);
    const [color, setColor] = useState('#f90');

    const matches = [...Editor.nodes(editor, {
        match: n => n.type === 'table-cell'
    })];

    const disabled = matches.length === 0;
    // const match = matches[matches.length - 1];

    const toggleMark = _ => {
        if (isMarkActive()) {
            Transforms.setNodes(editor, {
                cellColor: undefined
            }, {
                match: n => n.type === 'table-cell'
            });
        }
        else {
            Transforms.setNodes(editor, {
                cellColor: color
            }, {
                match: n => n.type === 'table-cell'
            });
        }
    }

    const isMarkActive = _ => {
        const [match] = Editor.nodes(editor, {
            match: n => n.type === 'table-cell' && n.cellColor === color,
            mode: 'all',
        });
        return !!match;
    }

    return (
        <>
            <Button
                disabled={disabled}
                className="editor-button editor-button-color"
                active={isMarkActive()}
                onMouseDown={event => {
                    event.preventDefault();
                    toggleMark();
                    setPickerActive(false);
                }}>
                <div style={{ background: color }}></div>
                <TableOutlined />
            </Button>

            <DropdownButton
                trigger='mousedown'
                active={pickerActive}
                setActive={v => {
                    setPickerActive(v);
                    if (v === false) {
                        getSelection(editor);
                        toggleMark();
                    }
                }}

                renderButton={(buttonRef) => {
                    return (
                        <Button
                            disabled={disabled}
                            className={`editor-button editor-button-color-r ${pickerActive ? "__dropdown" : ""}`}
                            active={pickerActive}
                            onMouseDown={event => {
                                event.preventDefault();
                                if (!pickerActive) {
                                    putSelection(editor);
                                }
                                setPickerActive(!pickerActive);
                            }}
                            ref={buttonRef}
                        >
                            <SwapRightOutlined />
                        </Button>
                    )
                }}

                renderDropdown={(setPickerActive) => {
                    return (
                        <div>
                            <SketchPicker
                                color={color}
                                onChange={({ hex }) => setColor(hex)}
                            />
                        </div>
                    )
                }}
            />
        </>
    )
}

const FontComponent = ({
    format = "fontFamily",
    defaultValue = SLATE_DEFAULTS.FONT_FAMILY,
    renderLabel = ({ value, label }) => (<span style={{ fontFamily: value }}>{label}</span>),
    options = fontFamilyOptions.map(v => {
        return {
            label: SLATE_DEFAULTS.FONT_FAMILY === v ? v + ' (默认)' : v,
            value: v
        };
    })
}) => {
    const editor = useSlate();
    let value = '/';

    const matches = getMarkActiveSet(editor, format);

    if (matches.length > 1) {
        value = '-----';  //muti style
    } else if (matches[0] === '') {
        value = defaultValue;  // not set yet
    } else {
        value = matches[0];
    }

    const action = (newValue) => {
        if (!getSelection(editor)) return;
        if (newValue === '') newValue = defaultValue;
        Editor.addMark(editor, format, newValue);
        //NOTE:颜色使用toggleMark是因为要将去色优先着色随后，但字体的话直接add就完事了
    };

    return (
        <DropdownButtonSelect
            trigger='mousedown'
            width={120}
            beforeClick={_ => putSelection(editor)}
            value={value}
            options={options}
            renderLabel={renderLabel}
            onChange={action}
        />
    )
}

const FontSizeComponent = ({
    format = "fontSize",
    defaultValue = SLATE_DEFAULTS.FONT_SIZE,
    options = fontSizeOptions.map(v => {
        return {
            label: SLATE_DEFAULTS.FONT_SIZE === v ? v + ' (默认)' : v,
            value: v
        };
    })
}) => {
    const editor = useSlate();
    let value = '/';

    const matches = getMarkActiveSet(editor, format);

    if (matches.length > 1) {
        value = '-----';  //muti style
    } else if (matches[0] === '') {
        value = defaultValue;  // not set yet
    } else {
        value = matches[0];
    }

    const action = (newValue) => {
        if (!getSelection(editor)) return;
        if (newValue === '') newValue = defaultValue;
        Editor.addMark(editor, format, newValue);
        //NOTE:颜色使用toggleMark是因为要将去色优先着色随后，但字体的话直接add就完事了
    };

    return (
        <DropdownButtonSelect
            trigger='mousedown'
            width={80}
            beforeClick={_ => putSelection(editor)}
            value={value}
            options={options}
            onChange={action}
        />
    )
}

export default Toolbar;