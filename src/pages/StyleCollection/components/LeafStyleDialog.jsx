import React, { useState, useEffect, useRef } from 'react';
import { useSlate } from 'slate-react';
import {
    BoldOutlined,
    ItalicOutlined,
    UnderlineOutlined,
    StrikethroughOutlined,
    FontColorsOutlined,
    FieldStringOutlined,
    FontSizeOutlined,
    EditOutlined,
} from '@ant-design/icons';

import Dialog from "@/components/Dialog";
import Button from "@/components/Button";
import Input from '@/components/Input';
import { Switch, CheckboxButton } from '@/components/Switch';
import { DropdownButton, DropdownButtonSelect } from '@/components/DropdownButton';
import { ColorPickerButton } from '@/components/ColorPicker';
import { setArrayItem } from '@/utils';
import { alt } from '@/utils';

import { fontFamilyOptions, SLATE_DEFAULTS, fontSizeOptions } from '@/utils/userSettings';
import { renderLeaf as Leaf } from '@/components/Editor/createEditor';

import './leafStyleDialog.scss';
import { Editor } from 'slate';

const leafStylesO = [
    ['bold', BoldOutlined, '粗体', { fontWeight: 'bold' }],
    ['italic', ItalicOutlined, '斜体', { fontStyle: 'italic' }],
    ['underline', UnderlineOutlined, '底线', { textDecoration: 'underline' }],
    ['strike', StrikethroughOutlined, '删除', { textDecoration: 'line-through' }],
];

const leafStyles = [
    ['bold', true],
    ['italic', true],
    ['underline', true],
    ['strike', true],
    ['fontFamily', SLATE_DEFAULTS.FONT_FAMILY],
    ['fontSize', SLATE_DEFAULTS.FONT_SIZE],
    ['fontColor', '#fff'],
    ['bgColor', '#000']
];

export const fromComputedLeafStyle = (style) => {
    let result = {};
    leafStyles.forEach(([key, defaultValue]) => {
        if (style[key] === undefined) {
            result[key] = [false, defaultValue];
        } else {
            result[key] = [true, style[key]];
        }
    }, style);
    return result;
}

export function useLeafStyleEditor({ customLeafStyle, setCustomLeafStyle }) {
    const [sampleText, setSampleText] = useState('文字样式示例');
    const [sampleTextEditable, setSampleTextEditable] = useState(false);

    const computedLeafStyle = {};
    Object.keys(customLeafStyle).forEach(key =>
        customLeafStyle[key][0] && (computedLeafStyle[key] = customLeafStyle[key][1])
    );

    const leafStyleEditor = (
        <div className="leaf-style-editor">
            <aside>
                {
                    leafStylesO.map(([name, Icon, text, style]) => {
                        return (
                            <div key={name} className={`style-item`}>
                                <CheckboxButton
                                    value={customLeafStyle[name][0]}
                                    onChange={v => setCustomLeafStyle({ ...customLeafStyle, [name]: setArrayItem(customLeafStyle[name], 0, v) })}
                                ><span style={{ ...style, fontSize: 12 }}><Icon />{text}</span></CheckboxButton>
                                <Switch
                                    value={customLeafStyle[name][1]}
                                    onChange={v => setCustomLeafStyle({ ...customLeafStyle, [name]: setArrayItem(customLeafStyle[name], 1, v) })}
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
                        onChange={v => setCustomLeafStyle({ ...customLeafStyle, fontFamily: setArrayItem(customLeafStyle.fontFamily, 0, v) })}
                    ><span style={{ fontFamily: '宋体', fontSize: 12 }}><FieldStringOutlined />{'字族'}</span></CheckboxButton>
                    <DropdownButtonSelect
                        disabled={!customLeafStyle.fontFamily[0]}
                        value={customLeafStyle.fontFamily[1]}
                        width={120}
                        renderLabel={({ value, label }) => (<span style={{ fontFamily: value }}>{label}</span>)}
                        options={
                            fontFamilyOptions.map(v => {
                                return {
                                    label: SLATE_DEFAULTS.FONT_FAMILY === v ? v + ' (默认)' : v,
                                    value: v
                                };
                            })
                        }
                        onChange={
                            v => setCustomLeafStyle({ ...customLeafStyle, fontFamily: setArrayItem(customLeafStyle.fontFamily, 1, v) })
                        }
                    />
                </div>
                <div className={`style-item`}>
                    <CheckboxButton
                        value={customLeafStyle.fontSize[0]}
                        onChange={v => setCustomLeafStyle({ ...customLeafStyle, fontSize: setArrayItem(customLeafStyle.fontSize, 0, v) })}
                    ><span style={{ fontSize: 10 }}><FontSizeOutlined />{'字号'}</span></CheckboxButton>
                    <DropdownButtonSelect
                        disabled={!customLeafStyle.fontSize[0]}
                        value={customLeafStyle.fontSize[1]}
                        width={120}
                        options={
                            fontSizeOptions.map(v => {
                                return {
                                    label: SLATE_DEFAULTS.FONT_SIZE === v ? v + ' (默认)' : v,
                                    value: v
                                };
                            })
                        }
                        onChange={
                            v => setCustomLeafStyle({ ...customLeafStyle, fontSize: setArrayItem(customLeafStyle.fontSize, 1, v) })
                        }
                    />
                </div>
                <div className={`style-item`}>
                    <CheckboxButton
                        value={customLeafStyle.fontColor[0]}
                        onChange={v => setCustomLeafStyle({ ...customLeafStyle, fontColor: setArrayItem(customLeafStyle.fontColor, 0, v) })}
                    ><span style={{ fontSize: 12, color: 'var(--blue-5)' }}><FontColorsOutlined />{'前景'}</span></CheckboxButton>
                    <ColorPickerButton
                        disabled={!customLeafStyle.fontColor[0]}
                        value={customLeafStyle.fontColor[1]}
                        onChange={
                            v => setCustomLeafStyle({ ...customLeafStyle, fontColor: setArrayItem(customLeafStyle.fontColor, 1, v) })
                        }
                    />
                </div>
                <div className={`style-item`}>
                    <CheckboxButton
                        value={customLeafStyle.bgColor[0]}
                        onChange={v => setCustomLeafStyle({ ...customLeafStyle, bgColor: setArrayItem(customLeafStyle.bgColor, 0, v) })}
                    ><span style={{ fontSize: 12, backgroundColor: 'var(--blue-3)' }}><FontColorsOutlined />{'背景'}</span></CheckboxButton>
                    <ColorPickerButton
                        disabled={!customLeafStyle.bgColor[0]}
                        value={customLeafStyle.bgColor[1]}
                        onChange={
                            v => setCustomLeafStyle({ ...customLeafStyle, bgColor: setArrayItem(customLeafStyle.bgColor, 1, v) })
                        }
                    />
                </div>
            </aside>
            <div className="sample-container slate-normalize">
                <pre><Leaf leaf={{}}>示例：</Leaf></pre>
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
            </div>
        </div>
    )
    return [computedLeafStyle, leafStyleEditor];
};

export const LeafStyleInfo = ({ info, setInfo, onApply }) => {
    const { title, group } = info;

    return (
        <div>
            <div className="form-like">
                <span>标题 *</span>
                <div>
                    <Input full value={title} onChange={v => setInfo(alt.set(info, 'title', v))} />
                </div>
                <span>分组 *</span>
                <div>
                    <Input full value={group} onChange={v => setInfo(alt.set(info, 'group', v))} />
                </div>
            </div>
            <Button
                disabled={!title.trim() || !group.trim()}
                onClick={_ => {
                    setInfo({ title: '', group: '' })
                    onApply(title, group);
                }}
                full
            >保存</Button>
        </div>
    )
};

export function LeafStyleDialogNoInput({ visible, setVisible, onApply, customLeafStyle, setCustomLeafStyle }) {
    const [computedLeafStyle, leafStyleEditor] = useLeafStyleEditor({ customLeafStyle, setCustomLeafStyle });

    return (
        <Dialog visible={visible} setVisible={setVisible}>
            {leafStyleEditor}
            <Button
                onClick={_ => {
                    onApply(computedLeafStyle);
                    setVisible(false);
                }}
            >提交</Button>
        </Dialog>
    )
}

export function LeafStyleDialog({ visible, setVisible, onApply, customLeafStyle, setCustomLeafStyle, info, setInfo }) {
    const [computedLeafStyle, leafStyleEditor] = useLeafStyleEditor({ customLeafStyle, setCustomLeafStyle });

    return (
        <Dialog visible={visible} setVisible={setVisible}>
            {leafStyleEditor}
            <LeafStyleInfo
                info={info}
                setInfo={setInfo}
                onApply={(title, group) => {
                    onApply(title, group, computedLeafStyle);
                    setVisible(false);
                }}
            />
        </Dialog>
    )
}

export function LeafStyleDialogWithStraw(props) {
    const { visible, customLeafStyle, setCustomLeafStyle } = props;

    const editor = useSlate();
    // get style from current selection when open dialog
    useEffect(_ => {
        if (visible) {
            const matches = [...Editor.nodes(editor, {
                match: n => n.text !== undefined,
                mode: 'lowest'
            })];
            if (matches && matches[0]) {
                const [[node]] = matches;
                setCustomLeafStyle(Object.keys(customLeafStyle).reduce(
                    (t, key) => {
                        if (node[key] === undefined)
                            return alt.set(t, `${key}.0`, false);
                        return alt.set(t, key, [true, node[key]]);
                    },
                    customLeafStyle
                ));
            }
        }
    }, [visible]);

    return (
        <LeafStyleDialog {...props} />
    )
}