import React, { useState, useEffect } from 'react';
import { useSlate, DefaultElement, ReactEditor } from 'slate-react';
import { Editor, Transforms } from 'slate';
import isHotkey from 'is-hotkey';
import { SketchPicker } from 'react-color';

import DropdownButton from '../../../components/DropdownButton/DropdownButton';
import Button from '@/components/MkButton';
import {
    BoldOutlined,
    ItalicOutlined,
    UnderlineOutlined,
    CodeOutlined,
    FontSizeOutlined,
    ContainerOutlined,
    OrderedListOutlined,
    UnorderedListOutlined,
    CaretRightOutlined,
    FontColorsOutlined,
    BgColorsOutlined,
    SwapRightOutlined
} from '@ant-design/icons';

import { toggleBlock, toggleMark, isMarkActive, isBlockActive, getMarkActiveSet, putSelection, getSelection } from '../utils'

const HOTKEYS_MARK = {
    'mod+b': 'bold',
    'mod+i': 'italic',
    'mod+u': 'underline',
    'mod+`': 'code',
};

const HOTKEYS_BLOCK = {
    'mod+.': 'bulleted-list',
    'mod+/': 'numbered-list'
};

export const higherOrderKeydownHandler = (editor) => {
    return event => {
        for (const hotkey in HOTKEYS_MARK) {
            if (isHotkey(hotkey, event)) {
                event.preventDefault();
                toggleMark(editor, HOTKEYS_MARK[hotkey]);
            }
        }
        for (const hotkey in HOTKEYS_BLOCK) {
            if (isHotkey(hotkey, event)) {
                event.preventDefault();
                toggleBlock(editor, HOTKEYS_BLOCK[hotkey]);
            }
        }

    }
}

export const Toolbar = () => {

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
            <Divider />
            <ActionButton />
            <ActionButtonX />
            <Divider />
            <ColorButton
                format="fontColor"
                icon={FontColorsOutlined}
            />
            <ColorButton
                format="bgColor"
                icon={BgColorsOutlined}
            />
            <Divider />
            <FontComponent />
        </div>
    );
};

const Divider = () => (<span className="divider"></span>)


const BlockButton = ({ format, icon }) => {
    const editor = useSlate();
    const Icon = icon;
    return (
        <Button
            className="editor-button"
            onMouseDown={event => {
                event.preventDefault();
                toggleBlock(editor, format);
            }}
            active={isBlockActive(editor, format)}
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
        </Button>
    )
}
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
                    action();
                    setPickerActive(false);
                }}>
                <div style={{ background: color }}></div>
                <Icon />
            </Button>
            <Button
                className="editor-button editor-button-color-r"
                active={pickerActive}
                onMouseDown={event => {
                    event.preventDefault();
                    setPickerActive(!pickerActive);
                }}
            >
                <SwapRightOutlined />
                <div
                    className="color-picker"
                    onMouseDown={event => { event.stopPropagation() }}
                >
                    {
                        pickerActive ?
                            <SketchPicker
                                color={color}
                                onChangeComplete={({ hex }) => {
                                    action(hex);
                                }} /> :
                            null
                    }
                </div>
            </Button>
        </>
    )
}

const DEAFULT_FONT_FAMILY = "等线 Light";

const FontComponent = () => {
    const editor = useSlate();
    let value;

    const matches = getMarkActiveSet(editor, 'fontFamily');

    if (matches.length > 1) {
        value = '-----';
    } else if (matches[0] === '') {
        value = DEAFULT_FONT_FAMILY;
    } else {
        value = matches[0];
    }

    const action = (newValue) => {
        if (!getSelection(editor)) return;
        if (newValue === '') newValue = DEAFULT_FONT_FAMILY;
        Editor.addMark(editor, 'fontFamily', newValue);
        //NOTE:颜色使用toggleMark是因为要将去色优先着色随后，但字体的话直接add就完事了
    };

    return (
        <>
            <DropdownButton
                beforeClick={_ => putSelection(editor)}
                value={value}
                options={[
                    { label: '等线 Light（默认）', value: DEAFULT_FONT_FAMILY },
                    { label: '微软雅黑', value: '微软雅黑' },
                    { label: '等线', value: '等线' },
                    { label: '宋体', value: '宋体' }
                ]}
                action={action}
                renderLabel={({ value, label }) => (<span style={{ fontFamily: value }}>{label}</span>)}
                width={120}
            />
        </>
    )
}