import React, { useMemo, useState } from 'react';
import { Editable, withReact, Slate } from 'slate-react';
import {
    PlusCircleOutlined,
    BoldOutlined,
    ItalicOutlined,
    UnderlineOutlined,
    FontColorsOutlined,
    BgColorsOutlined,
    FieldStringOutlined,
    FontSizeOutlined,
    SwapRightOutlined
} from '@ant-design/icons';
import { SketchPicker } from 'react-color';

import './style.scss';

import Editor from '@/components/Editor';
import Button from '@/components/MkButton';
import Dialog from '@/components/Dialog';
import { ColorPicker } from '@/components/ColorPicker';

import { Switch, CheckboxButton } from '@/components/Switch';
import { setArrayItem, setObject } from '@/utils';
import { DropdownButtonSelect, DropdownButton } from '@/components/DropdownButton';
import { fontFamilyOptions, DEAFULT_FONT_FAMILY, fontSizeOptions, DEAFULT_FONT_SIZE } from '@/utils/userSettings';

const SC = () => {
    const [dv, sdv] = useState(false);

    const [trible, setTrible] = useState('#dddd66');

    const handleChange = value => {
        setTrible(value);
    }

    const [customLeafStyle, setcustomLeafStyle] = useState({
        bold: [false, true],
        italic: [false, true],
        underline: [false, true],
        fontFamily: [false, DEAFULT_FONT_FAMILY],
        fontSize: [false, DEAFULT_FONT_SIZE],
        fontColor: [false, '#000'],
        bgColor: [false, '#fff'],
    });
    const leafStylesO = useMemo(_ => [
        ['bold', BoldOutlined, '粗体', { fontWeight: 'bold' }],
        ['italic', ItalicOutlined, '斜体', { fontStyle: 'italic' }],
        ['underline', UnderlineOutlined, '底线', { textDecoration: 'underline' }],
    ], []);

    return (
        <div className="style-collection">
            <br />
            <br />
            <br />
            <br />

            <Button onClick={_ => sdv(true)}>sc</Button>
            <ColorPicker value={trible} onChange={setTrible} />
            <Dialog visible={dv} setVisible={sdv}>
                <div className="leaf-style-editor">
                    <div className="sample slate-normalize">
                        <pre><span>对照组</span></pre>
                        <span>文字样式示例</span>
                        <pre><span>对照组</span></pre>
                    </div>
                    <aside>
                        {
                            leafStylesO.map(([name, Icon, text, style]) => {
                                return (
                                    <div key={name} className={`style-item`}>
                                        <CheckboxButton
                                            value={customLeafStyle[name][0]}
                                            onChange={v => setcustomLeafStyle({ ...customLeafStyle, [name]: setArrayItem(customLeafStyle[name], 0, v) })}
                                        ><span style={{ ...style, fontSize: 12 }}><Icon />{text}</span></CheckboxButton>
                                        <Switch
                                            value={customLeafStyle[name][1]}
                                            onChange={v => setcustomLeafStyle({ ...customLeafStyle, [name]: setArrayItem(customLeafStyle[name], 1, v) })}
                                            disabled={!customLeafStyle[name][0]}
                                            inactiveColor={'var(--purple-5)'}
                                        />
                                    </div>
                                )
                            })
                        }
                        <div className={`style-item`}>
                            <CheckboxButton
                                value={customLeafStyle.fontFamily[0]}
                                onChange={v => setcustomLeafStyle({ ...customLeafStyle, fontFamily: setArrayItem(customLeafStyle.fontFamily, 0, v) })}
                            ><span style={{ fontFamily: '宋体', fontSize: 12 }}><FieldStringOutlined />{'字族'}</span></CheckboxButton>
                            <DropdownButtonSelect
                                disabled={!customLeafStyle.fontFamily[0]}
                                value={customLeafStyle.fontFamily[1]}
                                width={120}
                                renderLabel={({ value, label }) => (<span style={{ fontFamily: value }}>{label}</span>)}
                                options={
                                    fontFamilyOptions.map(v => {
                                        return {
                                            label: DEAFULT_FONT_FAMILY === v ? v + ' (默认)' : v,
                                            value: v
                                        };
                                    })
                                }
                                onChange={
                                    v => setcustomLeafStyle({ ...customLeafStyle, fontFamily: setArrayItem(customLeafStyle.fontFamily, 1, v) })
                                }
                            />
                        </div>
                        <div className={`style-item`}>
                            <CheckboxButton
                                value={customLeafStyle.fontSize[0]}
                                onChange={v => setcustomLeafStyle({ ...customLeafStyle, fontSize: setArrayItem(customLeafStyle.fontSize, 0, v) })}
                            ><span style={{ fontSize: 10 }}><FontSizeOutlined />{'字号'}</span></CheckboxButton>
                            <DropdownButtonSelect
                                disabled={!customLeafStyle.fontSize[0]}
                                value={customLeafStyle.fontSize[1]}
                                width={120}
                                options={
                                    fontSizeOptions.map(v => {
                                        return {
                                            label: DEAFULT_FONT_SIZE === v ? v + ' (默认)' : v,
                                            value: v
                                        };
                                    })
                                }
                                onChange={
                                    v => setcustomLeafStyle({ ...customLeafStyle, fontSize: setArrayItem(customLeafStyle.fontSize, 1, v) })
                                }
                            />
                        </div>
                        <div className={`style-item`}>
                            <CheckboxButton
                                value={customLeafStyle.fontColor[0]}
                                onChange={v => setcustomLeafStyle({ ...customLeafStyle, fontColor: setArrayItem(customLeafStyle.fontColor, 0, v) })}
                            ><span style={{ fontSize: 12, color: 'var(--blue-5)' }}><FontColorsOutlined />{'前景'}</span></CheckboxButton>
                            <ColorPickerButton
                                disabled={!customLeafStyle.fontColor[0]}
                                value={customLeafStyle.fontColor[1]}
                                onChange={
                                    v => setcustomLeafStyle({ ...customLeafStyle, fontColor: setArrayItem(customLeafStyle.fontColor, 1, v) })
                                }
                            />
                        </div>
                        <div className={`style-item`}>
                            <CheckboxButton
                                value={customLeafStyle.bgColor[0]}
                                onChange={v => setcustomLeafStyle({ ...customLeafStyle, bgColor: setArrayItem(customLeafStyle.bgColor, 0, v) })}
                            ><span style={{ fontSize: 12, backgroundColor: 'var(--blue-3)' }}><FontColorsOutlined />{'背景'}</span></CheckboxButton>
                            <ColorPickerButton
                                disabled={!customLeafStyle.bgColor[0]}
                                value={customLeafStyle.bgColor[1]}
                                onChange={
                                    v => setcustomLeafStyle({ ...customLeafStyle, bgColor: setArrayItem(customLeafStyle.bgColor, 1, v) })
                                }
                            />
                        </div>
                    </aside>
                </div>
            </Dialog>
            {/* <Editor initialValue={initialValue} >
                <div><p>hahah</p></div>
            </Editor> */}

        </div>
    )
}

const ColorPickerButton = ({ disabled, value, onChange }) => {
    const [pickerActive, setPickerActive] = useState(false);

    return (
        <DropdownButton
            active={pickerActive}
            setActive={_ => setPickerActive(_)}

            renderButton={
                (buttonRef) => {
                    return (
                        <Button
                            disabled={disabled}
                            className={`${pickerActive ? " __dropdown" : ""}`}
                            active={pickerActive}
                            onMouseDown={event => {
                                event.preventDefault();
                                if (!disabled) {
                                    setPickerActive(!pickerActive);
                                }
                            }}
                            ref={buttonRef}
                        >
                            <div style={{
                                width: '100%',
                                height: '100%',
                                background: value,
                            }}>
                            </div>
                        </Button>
                    )
                }
            }

            renderDropdown={
                (setPickerActive) => {
                    return (
                        <div className="color-picker">
                            <SketchPicker
                                color={value}
                                onChange={({ hex }) => {
                                    onChange(hex);
                                }}
                            />
                        </div>
                    )
                }
            }
        />
    )
}


const initialValue = [
    {
        align: 'right',
        children: [
            {
                fontFamily: '等线',
                fontSize: 16,
                text:
                    'Since the editor is based on a recursive tree model, similar to an HTML document, you can create complex nested structures, like tables:',
            },
        ],
    },
];

export default SC;