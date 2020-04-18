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
    StarOutlined
} from '@ant-design/icons';

import { toggleBlock, toggleMark, isMarkActive, isBlockActive, getMarkActiveSet, putSelection, getSelection } from './utils';

import { fontSizeOptions, fontFamilyOptions, DEAFULT_FONT_FAMILY, DEAFULT_FONT_SIZE } from '@/utils/userSettings';
import Dialog from '../Dialog';

const Toolbar = () => {

    return (
        <div className="editor-toolbar">
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
            </div>
            <div className="toolbar-group">
                <ActionButton />
                <ActionButtonX />
            </div>
        </div>
    );
};

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
    if (!match) return [];

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
        match: n => n.type === 'table'
    })];

    const disabled = matches.length === 0;
    const match = matches[matches.length - 1];

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

const TableStyleButton = () => {
    const editor = useSlate();
    const matches = [...Editor.nodes(editor, {
        match: n => n.type === 'table'
    })];

    const disabled = matches.length === 0;
    const match = matches[matches.length - 1];

    return (
        <>
            <Button
                className="editor-button"
                onMouseDown={
                    event => {
                        event.preventDefault();

                    }
                }
            >
                <TableOutlined />
            </Button>
            <Dialog full unmountOnExit>

            </Dialog>
        </>
    )
}

const FontStyleButton = () => {
    const editor = useSlate();

    return (
        <Button
            className="editor-button"
            onMouseDown={
                event => {
                    event.preventDefault();


                }
            }
        >
            <TableOutlined />
        </Button>
    );
}

const ActionButton = () => {
    const editor = useSlate();
    return (
        <Button
            className="editor-button"
            onMouseDown={
                event => {
                    event.preventDefault();
                    getSelection(editor);
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

    const setActiveForDropdown = v => {
        setPickerActive(v);
        if (v === false) {
            getSelection(editor);
            toggleMark(editor, format, color);
        }
    };

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
                setActive={setActiveForDropdown}

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

const FontComponent = ({
    format = "fontFamily",
    defaultValue = DEAFULT_FONT_FAMILY,
    renderLabel = ({ value, label }) => (<span style={{ fontFamily: value }}>{label}</span>),
    options = fontFamilyOptions.map(v => {
        return {
            label: DEAFULT_FONT_FAMILY === v ? v + ' (默认)' : v,
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
    defaultValue = DEAFULT_FONT_SIZE,
    options = fontSizeOptions.map(v => {
        return {
            label: DEAFULT_FONT_SIZE === v ? v + ' (默认)' : v,
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