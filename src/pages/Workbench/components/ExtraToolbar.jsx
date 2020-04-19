import React, { useState, useEffect } from 'react';
import {
    PlusCircleOutlined,
    BoldOutlined,
    ItalicOutlined,
    UnderlineOutlined,
    StrikethroughOutlined,
    FontColorsOutlined,
    BgColorsOutlined,
    FieldStringOutlined,
    FontSizeOutlined,
    SwapRightOutlined,
    ApiOutlined,
    AppstoreAddOutlined,
    EditOutlined
} from '@ant-design/icons';
import { SketchPicker } from 'react-color';
import { useSlate } from 'slate-react';

import Dialog from "@/components/Dialog";
import Button from "@/components/MkButton";
import Input from '@/components/Input';

import { alt } from '@/utils';

import { renderLeaf as Leaf } from '@/components/Editor/createEditor';

import { Switch, CheckboxButton } from '@/components/Switch';
import { setArrayItem } from '@/utils';
import { DropdownButton, DropdownButtonSelect } from '@/components/DropdownButton';
import { fontFamilyOptions, DEAFULT_FONT_FAMILY, fontSizeOptions, DEAFULT_FONT_SIZE, mockedCustomStyles } from '@/utils/userSettings';
import { Editor } from 'slate';

const leafStylesO = [
    ['bold', BoldOutlined, '粗体', { fontWeight: 'bold' }],
    ['italic', ItalicOutlined, '斜体', { fontStyle: 'italic' }],
    ['underline', UnderlineOutlined, '底线', { textDecoration: 'underline' }],
    ['strike', StrikethroughOutlined, '删除', { textDecoration: 'line-through' }],
];
// mockedCustomTableBackground

const DialogNewLeafStyle = ({ visible, setVisible, onApply }) => {
    const editor = useSlate();
    
    const [title, setTitle] = useState('');
    const [group, setGroup] = useState('');
    const [visibleDialogSave, setVisibleDialogSave] = useState(false);

    const [sampleText, setSampleText] = useState('文字样式示例');
    const [sampleTextEditable, setSampleTextEditable] = useState(false);

    const [customLeafStyle, setcustomLeafStyle] = useState({
        bold: [false, true],
        italic: [false, true],
        underline: [false, true],
        strike: [false, true],
        fontFamily: [false, DEAFULT_FONT_FAMILY],
        fontSize: [false, DEAFULT_FONT_SIZE],
        fontColor: [false, '#000'],
        bgColor: [false, '#fff'],
    });

    useEffect(_ => {
        if (visible) {
            const matches = [...Editor.nodes(editor, {
                match: n => n.text !== undefined,
                mode: 'lowest'
            })];
            if (matches && matches[0]) {
                const [[node]] = matches;
                const a = Object.keys(customLeafStyle);
                const tt = a.reduce(
                    (t, key) => {
                        if (node[key] === undefined)
                            return alt.set(t, `${key}.0`, false);
                        return alt.set(t, key, [true, node[key]]);
                    },
                    customLeafStyle
                )
                setcustomLeafStyle(tt);
            }
        }
    }, [visible]);

    const computedLeafStyle = {};
    Object.keys(customLeafStyle).forEach(key =>
        customLeafStyle[key][0] && (computedLeafStyle[key] = customLeafStyle[key][1])
    );

    return (
        <>
            <Dialog visible={visible} setVisible={setVisible}>
                <div className="leaf-style-editor">
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

                        <br />
                        <div>
                            <Button onClick={_ => setVisibleDialogSave(true)} full>下一步</Button>
                        </div>
                    </aside>
                    <div className="sample-container slate-normalize">
                        <pre><span>对照组</span></pre>
                        {
                            sampleTextEditable ?
                                <div>
                                    <Input full value={sampleText} onChange={setSampleText} onEnterKey={_ => setSampleTextEditable(false)} />
                                    <br />
                                    <Button onClick={_ => setSampleTextEditable(false)} >确定</Button>
                                </div>
                                :
                                <pre className="sample">
                                    <Leaf leaf={computedLeafStyle}>{sampleText}</Leaf>
                                    <span onClick={_ => setSampleTextEditable(true)}><EditOutlined /></span>
                                </pre>
                        }
                        <pre><span>对照组</span></pre>
                    </div>
                </div>
            </Dialog>
            <Dialog visible={visibleDialogSave} setVisible={setVisibleDialogSave}>
                <div className="form-like">
                    <span>标题 *</span>
                    <div style={{ display: 'inline-block' }}>
                        <Input full value={title} onChange={setTitle} onEnterKey={_ => setSampleTextEditable(false)} />
                    </div>
                    <span>分组 *</span>
                    <div style={{ display: 'inline-block' }}>
                        <Input full value={group} onChange={setGroup} onEnterKey={_ => setSampleTextEditable(false)} />
                    </div>
                </div>
                <Button disabled={!title.trim() || !group.trim()} onClick={_ => {
                    setVisibleDialogSave(false);
                    setVisible(false);
                    setTitle('');
                    setGroup('');
                    onApply(title, group, computedLeafStyle)
                }} full>保存</Button>
            </Dialog>
        </>
    )
};

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
                        <div>
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

const ExtraToolbar = () => {
    const [visibleDialogNewLeafStyle, setVisibleDialogNewLeafStyle] = useState();

    return (
        <>
            <div className="editor-toolbar">
                <Button className="editor-button" onMouseDown={e => {
                    e.preventDefault();
                    setVisibleDialogNewLeafStyle(true);
                }}>
                    <AppstoreAddOutlined />
                </Button>
            </div>
            <DialogNewLeafStyle
                onApply={
                    (title, group, style) => mockedCustomStyles.push({ title, group, style })
                }
                visible={visibleDialogNewLeafStyle}
                setVisible={setVisibleDialogNewLeafStyle}
            />
        </>
    );
};

export default ExtraToolbar;