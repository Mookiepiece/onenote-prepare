import React, { useState, useEffect } from 'react';
import { useSlate, DefaultElement, ReactEditor } from 'slate-react';
import { Editor, Transforms } from 'slate';
import isHotkey from 'is-hotkey';
import { SketchPicker } from 'react-color';

import DropdownButton from '../../../components/DropdownButton/DropdownButton';

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

const ActionButton = () => {
    const editor = useSlate();
    return (
        <button
            className="editor-button"
            onMouseDown={
                event => {
                    event.preventDefault();
                    putSelection(editor);
                }
            }
        >
            <CaretRightOutlined />
        </button>
    )
}
const ActionButtonX = () => {
    const editor = useSlate();
    return (
        <button
            className="editor-button"
            onMouseDown={
                event => {
                    event.preventDefault();
                    getSelection(editor);
                }
            }
        >
            <CaretRightOutlined />
        </button>
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

    const className = `editor-button editor-button-color ${isMarkActive(editor, format, color) ? 'editor-button-active' : ''}`;
    const classNameR = `editor-button editor-button-color-r ${pickerActive ? 'editor-button-active' : ''}`

    const Icon = icon;

    //click left button, toggle color state of selection
    //click right button, toggle color picker
    return (
        <>
            <button
                className={className}
                onMouseDown={event => {
                    event.preventDefault();
                    action();
                    setPickerActive(false);
                }}>
                <div style={{ background: color }}></div>
                <Icon />
            </button>
            <button
                className={classNameR}
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
            </button>
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
        getSelection(editor);
        if (newValue === '') newValue = DEAFULT_FONT_FAMILY;
        Editor.addMark(editor, 'fontFamily', newValue);
        //NOTE:颜色使用toggleMark是因为要将去色优先着色随后，但字体的话直接add就完事了
    };

    return (
        <>
            <DropdownButton
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

            {/* {
                pickerActive ?
                    <Select
                        value={value}
                        onChange={action}
                        showSearch
                        placeholder="Select a person"
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.trim().toLowerCase()) >= 0
                        }
                    >
                        <Option value="">（默认）</Option>
                        <Option value="微软雅黑">微软雅黑</Option>
                        <Option value="等线">等线</Option>
                        <Option value="宋体">宋体</Option>
                    </Select> :
                    <Button type="primary" onMouseDown={event => {
                        event.preventDefault();
                        putSelection(editor);
                        setPickerActive(true);
                    }}>{value}</Button>
            } */}
        </>
    )
}