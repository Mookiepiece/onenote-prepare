import React, { useState, useEffect } from 'react';
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
    TableOutlined
} from '@ant-design/icons';

import { toggleBlock, toggleMark, isMarkActive, isBlockActive, getMarkActiveSet, putSelection, getSelection } from './utils';

import { fontSizeOptions, fontFamilyOptions, DEAFULT_FONT_FAMILY, DEAFULT_FONT_SIZE } from '@/utils/userSettings';

const Toolbar = () => {

    return (
        <div className="editor-toolbar">
            <div className="toolbar-group">
                <FontComponent />
                <FontSizeComponent />
                <MarkButton format="bold" icon={BoldOutlined} />
                <MarkButton format="italic" icon={ItalicOutlined} />
                <MarkButton format="underline" icon={UnderlineOutlined} />
                <MarkButton format="strike" icon={StrikethroughOutlined} />
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
                <ActionButton />
                <ActionButtonX />
                <TableButton />
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
                    Transforms.wrapNodes(editor, { type: 'table-cell', children: [] });
                    Transforms.wrapNodes(editor, { type: 'table-row', children: [] });
                    Transforms.wrapNodes(editor, { type: 'table', children: [] });

                }
            }
        >
            <TableOutlined />
        </Button>
    )
}

const ActionButton = () => {
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

    const action = (newColor = color) => {
        // getSelection(editor);
        setColor(newColor);
        // toggleMark(editor, format, newColor);
    }
    const actionX = (newColor = color) => {
        // getSelection(editor);
        setColor(newColor);
        toggleMark(editor, format, newColor);
    }

    const Icon = icon;

    return (
        <>
            <Button
                className="editor-button editor-button-color"
                active={isMarkActive(editor, format, color)}
                onMouseDown={event => {
                    event.preventDefault();
                    actionX();
                    setPickerActive(false);
                }}>
                <div style={{ background: color }}></div>
                <Icon />
            </Button>

            <DropdownButton
                trigger='mousedown'
                active={pickerActive}
                setActive={_ => setPickerActive(_)}
                beforeClick={_ => putSelection(editor)}

                renderButton={
                    (buttonRef) => {
                        return (
                            <Button
                                className={`editor-button editor-button-color-r${pickerActive ? " __dropdown" : ""}`}
                                active={pickerActive}
                                onMouseDown={event => {
                                    event.preventDefault();
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
                            <div
                                className="color-picker"
                            >
                                <SketchPicker
                                    color={color}
                                    onChange={({ hex }) => {
                                        action(hex);
                                    }}
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