import React, { useState, useEffect } from 'react';
import { useSlate, DefaultElement, ReactEditor } from 'slate-react';
import { Editor, Transforms, Range, Text, Path, Location, Point } from 'slate';
import isHotkey from 'is-hotkey';
import { SketchPicker } from 'react-color';

import DropdownButtonMousedownSelect from '@/components/DropdownButton/DropdownButtonMousedownSelect';
import DropdownButtonMousedown from '@/components/DropdownButton/DropdownButtonMousedown';

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
    SwapRightOutlined,
    AlignLeftOutlined,
    AlignCenterOutlined,
    AlignRightOutlined
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
            <Divider />
            <BlockButton format="heading-one" icon={FontSizeOutlined} />
            <BlockButton format="heading-two" icon={FontSizeOutlined} />
            <BlockButton format="block-quote" icon={ContainerOutlined} />
            <Divider />
            <BlockButton format="numbered-list" icon={OrderedListOutlined} />
            <BlockButton format="bulleted-list" icon={UnorderedListOutlined} />
            <Divider />
            <BlockButton formatKey="align" format="left" icon={AlignLeftOutlined} />
            <BlockButton formatKey="align" format="center" icon={AlignCenterOutlined} />
            <BlockButton formatKey="align" format="right" icon={AlignRightOutlined} />
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
            <FontSizeComponent />
        </div>
    );
};

const Divider = () => (<span className="divider"></span>)


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

const ActionButton = () => {
    const editor = useSlate();
    return (
        <Button
            className="editor-button"
            onMouseDown={
                event => {
                    event.preventDefault();

                    const children = editor.children;
                    let childrenAlt = [...children];

                    const ranges = [];

                    //递归遍历树
                    const v = (el, path, children, childrenAlt) => {

                        if (!el.text) {
                            if (!el.type || el.type === 'pre') {
                                //pre里面只能有一层span了，故遍历一层拿出text
                                //因为span里面不能继续嵌套p不会改变其它地方的path，所以不用担心因为高亮而split会在嵌套情况下出错，
                                const innerText = el.children.reduce((result, leaf) => result + leaf.text, '');

                                let reIndex = innerText.indexOf('###');

                                let count = 0;

                                let anchor, focus;

                                //遍历叶子算匹配到的最叶位置
                                el.children.every((leaf, index) => {
                                    let length = Editor.end(editor, [...path, index]).offset;

                                    if (!anchor) {
                                        //anchor 必须在下一个node的开头而非本node的结尾 否则会把这个node搭上 不加等号
                                        if (count + length > reIndex) {
                                            anchor = {
                                                path: [...path, index],
                                                offset: reIndex - count
                                            };
                                            //focus 最好能在node的末尾而非开头 加等号
                                            if (count + length >= reIndex + 3) {
                                                focus = {
                                                    path: [...path, index],
                                                    offset: reIndex - count + 3
                                                };
                                                return false;
                                            }
                                        }
                                    } else {
                                        if (count + length >= reIndex + 3) {
                                            focus = {
                                                path: [...path, index],
                                                offset: reIndex - count + 3
                                            }
                                            return false;
                                        }
                                    }
                                    count += length;
                                    return true;
                                });

                                if (reIndex > -1) {
                                    ranges.push({
                                        anchor,
                                        focus
                                        // anchor: { path: [...path, 0], offset: innerText.indexOf('###') },
                                        // focus: { path: [...path, 0], offset: innerText.indexOf('###') + 3 },
                                    });
                                }
                            } else {
                                el.children && el.children.forEach((el, index) => v(el, [...path, index], children, childrenAlt));
                            }
                        }
                    };
                    children.forEach((el, index) => v(el, [index], children, childrenAlt));


                    ranges.forEach(at => {
                        console.log(at);
                        Transforms.setNodes(editor, {
                            bling: true,
                        }, {
                            match: n => Text.isText(n),
                            at,
                            split: true
                        });
                        // Editor.
                    });
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
                    Transforms.setNodes(editor, {
                        bling: false,
                    }, {
                        at: Editor.range(editor, Editor.edges(editor)[0], Editor.edges(editor)[1]),
                        match: n => Text.isText(n),
                        split: true

                    });
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

            <DropdownButtonMousedown
                active={pickerActive}
                setActive={_ => setPickerActive(_)}
                beforeClick={_ => putSelection(editor)}

                renderButton={
                    (buttonRef) => {
                        return (
                            <Button
                                className={`editor-button editor-button-color-r${pickerActive ? " dropdown" : ""}`}
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
                                }
                            </div>
                        )
                    }
                }
            />
        </>
    )
}

const DEAFULT_FONT_FAMILY = "等线 Light";
const DEAFULT_FONT_SIZE = 12;

const useMutiActiveSet = (format, defaultValue) => {
    const editor = useSlate();
}

const FontComponent = ({
    format = "fontFamily",
    defaultValue = DEAFULT_FONT_FAMILY,
    renderLabel = ({ value, label }) => (<span style={{ fontFamily: value }}>{label}</span>),
    options = [
        { label: `${defaultValue}（默认）`, value: defaultValue },
        { label: '微软雅黑', value: '微软雅黑' },
        { label: '等线', value: '等线' },
        { label: '宋体', value: '宋体' }
    ]
}) => {
    const editor = useSlate();
    let value;

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
        <DropdownButtonMousedownSelect
            width={120}
            beforeClick={_ => putSelection(editor)}
            text={value}
            options={options}
            renderLabel={renderLabel}
            action={action}
        />
    )
}

const FontSizeComponent = ({
    format = "fontSize",
    defaultValue = DEAFULT_FONT_SIZE,
    options = [
        { label: `14（默认）`, value: 14 },
        { label: '16', value: 16 },
        { label: '18', value: 18 },
        { label: '20', value: 20 },
        { label: '22', value: 22 },
        { label: '24', value: 24 },
        { label: '26', value: 26 },
        { label: '28', value: 28 },
    ]
}) => {
    const editor = useSlate();
    let value;

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
        <DropdownButtonMousedownSelect
            width={120}
            beforeClick={_ => putSelection(editor)}
            text={value}
            options={options}
            action={action}
        />
    )
}