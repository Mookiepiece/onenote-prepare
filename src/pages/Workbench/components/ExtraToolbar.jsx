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
    EditOutlined,
    HistoryOutlined,
    PlusOutlined,
    UpOutlined,
    DownOutlined,
    CloseOutlined
} from '@ant-design/icons';
import { SketchPicker } from 'react-color';
import { useSlate } from 'slate-react';
import { ReadOnlySlateEditor } from '@/components/Editor';

import Dialog from "@/components/Dialog";
import Button from "@/components/MkButton";
import Input from '@/components/Input';

import { alt, deepCopy } from '@/utils';
import { connect } from 'react-redux';

import { renderLeaf as Leaf } from '@/components/Editor/createEditor';

import { Switch, CheckboxButton } from '@/components/Switch';
import { setArrayItem } from '@/utils';
import { DropdownButton, DropdownButtonSelect } from '@/components/DropdownButton';
import { fontFamilyOptions, SLATE_DEFAULTS, fontSizeOptions, mockedCustomStyles } from '@/utils/userSettings';
import { Editor } from 'slate';
import ActionTypes from '@/redux/actions';
import { v4 as uuid } from 'uuid';
import CachedInput from '@/components/Input/cachedInput';
import StylePickerDialog from './StylePickerDialog';

const leafStylesO = [
    ['bold', BoldOutlined, '粗体', { fontWeight: 'bold' }],
    ['italic', ItalicOutlined, '斜体', { fontStyle: 'italic' }],
    ['underline', UnderlineOutlined, '底线', { textDecoration: 'underline' }],
    ['strike', StrikethroughOutlined, '删除', { textDecoration: 'line-through' }],
];

const LeafStlyeDialog = ({ visible, setVisible, onApply }) => {
    const editor = useSlate();

    const [sampleText, setSampleText] = useState('文字样式示例');
    const [sampleTextEditable, setSampleTextEditable] = useState(false);

    const [customLeafStyle, setcustomLeafStyle] = useState({
        bold: [false, true],
        italic: [false, true],
        underline: [false, true],
        strike: [false, true],
        fontFamily: [false, SLATE_DEFAULTS.FONT_FAMILY],
        fontSize: [false, SLATE_DEFAULTS.FONT_SIZE],
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
                                            label: SLATE_DEFAULTS.FONT_FAMILY === v ? v + ' (默认)' : v,
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
                                            label: SLATE_DEFAULTS.FONT_SIZE === v ? v + ' (默认)' : v,
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

                        <hr />
                        <div>
                            <Button onClick={_ => onApply(computedLeafStyle)} full>提交</Button>
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
        </>
    )
};

const SaveLeafStyleDialog = ({ visible, setVisible, onApply }) => {
    const [title, setTitle] = useState('');
    const [group, setGroup] = useState('');

    return (
        <Dialog visible={visible} setVisible={setVisible}>
            <p>新建样式</p>
            <hr />
            <div className="form-like">
                <span>标题 *</span>
                <div>
                    <Input full value={title} onChange={setTitle} />
                </div>
                <span>分组 *</span>
                <div>
                    <Input full value={group} onChange={setGroup} />
                </div>
            </div>
            <Button disabled={!title.trim() || !group.trim()} onClick={_ => {
                setVisible(false);
                setTitle('');
                setGroup('');
                onApply(title, group)
            }} full>保存</Button>
        </Dialog>
    )
}

const TableStyleDialog = ({ visible, setVisible }) => {
    const [rules, setRules] = useState([]);
    const [tableRows, setTableRows] = useState(5);
    const [tableCols, setTableCols] = useState(5);

    const [leafStlyeDialogVisible, setLeafStlyeDialogVisible] = useState(false);
    const [leafStlyeDialogOnApply, setLeafStlyeDialogOnApply] = useState([_ => _]);

    const computedTableStyle = (r, c) => {
        for (let rule of rules) {
            const result = [
                rule.inputs.cellColor[0] ? rule.inputs.cellColor[1] : null,
                rule.inputs.style[0] ? rule.inputs.style[1] : {}
            ];

            switch (rule.inputs.mode) {
                case 'row':
                    if (rule.inputs.inputs1 === 1) {
                        if (rule.inputs.inputs0 % 2 === r % 2)
                            return result;
                    } else if (rule.inputs.inputs1 === 0) {
                        return result;
                    } else {
                        if (rule.inputs.inputs0 === r) {
                            return result;
                        }
                    }
                    break;
                case 'col':
                    if (rule.inputs.inputs1 === 1) {
                        if (rule.inputs.inputs0 % 2 === c % 2)
                            return result;
                    } else if (rule.inputs.inputs1 === 0) {
                        return result;
                    } else {
                        if (rule.inputs.inputs0 === c) {
                            return result;
                        }
                    }
                    break;
                case 'cell':
                    if (rule.inputs.inputs1 === c && rule.inputs.inputs0 === r) return result;
                    break;
            }
        };
        return [null, {}];
    };

    return (
        <Dialog full visible={visible} setVisible={setVisible}>
            <div className='table-style-editor'>
                <aside>
                    <Button
                        disabled={rules.length === 10}
                        onClick={
                            _ => setRules([{
                                id: uuid(),
                                inputs: {
                                    inputs0: 1,
                                    inputs1: 1,
                                    mode: 'row',
                                    cellColor: [false, '#ddd'],
                                    style: [false, {}]
                                },
                                bg: '#ccf'
                            }, ...rules])
                        }><PlusOutlined /></Button>
                    <div className="table-style-list">
                        {rules.map((rule, i, rules) => {
                            let bottomInputs;
                            switch (rule.inputs.mode) {
                                case 'row':
                                case 'col':
                                    bottomInputs = (
                                        <>
                                            <span>目标-第：</span>
                                            <CachedInput
                                                width={80}
                                                rule={v => {
                                                    let vv = Number.parseInt(v);
                                                    if (vv === Number.NaN || !Number.isFinite(vv) || vv <= 0) {
                                                        return 1;
                                                    } else return vv;
                                                }}
                                                value={rule.inputs.inputs0}
                                                onChange={v => setRules(alt.set(rules, `${i}.inputs.inputs0`, v))}
                                            />
                                            <span>目标-重复：</span>
                                            <DropdownButtonSelect
                                                width={80}
                                                value={rule.inputs.inputs1}
                                                options={[0, 1, 2].map(v => ({ label: v, value: v }))}
                                                onChange={v => setRules(alt.set(rules, `${i}.inputs.inputs1`, v))}
                                            />
                                        </>
                                    )
                                    break;
                                case 'cell':
                                    bottomInputs = (
                                        <>
                                            <span>目标-行：</span>
                                            <CachedInput
                                                width={80}
                                                rule={v => {
                                                    let vv = Number.parseInt(v);
                                                    if (vv === Number.NaN || !Number.isFinite(vv) || vv <= 0) {
                                                        return 1;
                                                    } else return vv;
                                                }}
                                                value={rule.inputs.inputs0}
                                                onChange={v => setRules(alt.set(rules, `${i}.inputs.inputs0`, v))}
                                            />
                                            <span>目标-列：</span>
                                            <CachedInput
                                                width={80}
                                                rule={v => {
                                                    let vv = Number.parseInt(v);
                                                    if (vv === Number.NaN || !Number.isFinite(vv) || vv <= 0) {
                                                        return 1;
                                                    } else return vv;
                                                }}
                                                value={rule.inputs.inputs1}
                                                onChange={v => setRules(alt.set(rules, `${i}.inputs.inputs1`, v))}
                                            />
                                        </>
                                    )
                                    break;
                            }
                            return (
                                <div key={rule.id}>
                                    <Button
                                        onClick={_ => {
                                            setRules([...rules.slice(0, i), ...rules.slice(i + 1)])
                                        }}><CloseOutlined /></Button>
                                    <div>
                                        <Button
                                            full
                                            disabled={i === 0}
                                            onClick={_ => {
                                                setRules([...rules.slice(0, i - 1), rules[i], rules[i - 1], ...rules.slice(i + 1)])
                                            }}><UpOutlined /></Button>
                                        <Button
                                            full
                                            disabled={i === rules.length - 1}
                                            onClick={_ => {
                                                setRules([...rules.slice(0, i), rules[i + 1], rules[i], ...rules.slice(i + 2)])
                                            }}><DownOutlined /></Button>
                                    </div>
                                    <div>
                                        <p>{rule.id}</p>
                                        <div className="form-like">
                                            <span>目标：</span>
                                            <DropdownButtonSelect
                                                value={rule.inputs.mode}
                                                width={80}
                                                options={['row', 'col', 'cell'].map(v => ({ label: v, value: v }))}
                                                onChange={v => setRules(alt.set(rules, `${i}.inputs.mode`, v))}
                                            />
                                            {bottomInputs}
                                        </div>
                                        <hr />
                                        <div className="form-like" style={{ '--grid-template-columns': '100px 40px 40px' }}>
                                            <span>表格背景：</span>
                                            <div>
                                                <CheckboxButton
                                                    value={rule.inputs.cellColor[0]}
                                                    onChange={v => setRules(alt.set(rules, `${i}.inputs.cellColor.0`, v))}
                                                ></CheckboxButton>
                                            </div>
                                            <div>
                                                <ColorPickerButton
                                                    disabled={!rule.inputs.cellColor[0]}
                                                    value={rule.inputs.cellColor[1]}
                                                    onChange={v => setRules(alt.set(rules, `${i}.inputs.cellColor.1`, v))}
                                                />
                                            </div>
                                            <span>文本样式：</span>
                                            <div>
                                                <CheckboxButton
                                                    value={rule.inputs.style[0]}
                                                    onChange={v => setRules(alt.set(rules, `${i}.inputs.style.0`, v))}
                                                ></CheckboxButton>
                                            </div>
                                            <div>
                                                <Button
                                                    disabled={!rule.inputs.style[0]}
                                                    onClick={_ => {
                                                        setLeafStlyeDialogVisible(true);
                                                        setLeafStlyeDialogOnApply([(_, v) => setRules(alt.set(rules, `${i}.inputs.style.1`, v.style))]);
                                                    }}>
                                                    <Leaf leaf={{ ...rule.inputs.style[1], fontSize: undefined }}>T</Leaf>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </aside>
                <div className="sample-container slate-normalize">
                    <span>预览行：</span>
                    <DropdownButtonSelect
                        value={tableRows}
                        width={80}
                        dropdownWidth={80}
                        options={Array(20).fill(0).map((_, v) => ({ label: v + 1, value: v + 1 }))}
                        onChange={setTableRows}
                    />
                    <span>预览列：</span>
                    <DropdownButtonSelect
                        value={tableCols}
                        width={80}
                        dropdownWidth={80}
                        options={Array(20).fill(0).map((_, v) => ({ label: v + 1, value: v + 1 }))}
                        onChange={setTableCols}
                    />
                    <table>
                        <tbody>
                            {
                                Array(tableRows).fill(0).map((_, r) => (
                                    <tr key={r}>
                                        {Array(tableCols).fill(0).map((_, c) => {
                                            const [cellColor, style] = computedTableStyle(r + 1, c + 1);
                                            return (
                                                <td key={c} style={{ background: cellColor }}>
                                                    <Leaf leaf={style}>单元</Leaf>
                                                </td>
                                            )
                                        })}
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
                <StylePickerDialog
                    visible={leafStlyeDialogVisible}
                    setVisible={setLeafStlyeDialogVisible}
                    onApply={leafStlyeDialogOnApply[0]}
                />
            </div>
        </Dialog>
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

const HistoryDialog = connect(state => ({
    history: state.workbenchAside.memory
}))(({ visible, setVisible, setSlateValue, history, dispatch }) => {
    const [value, setValue] = useState([{ children: [{ text: '' }] }]);
    const [index, setIndex] = useState(-1);

    const editor = useSlate();

    useEffect(_ => {
        if (visible) {
            setValue(deepCopy(editor.children));
            setIndex(-1);
        }
    }, [visible]);

    useEffect(_ => {
        if (index === -1) {
            setValue(deepCopy(editor.children));
        } else {
            setValue(history[index].value);
        }
    }, [index]);

    return (
        <Dialog visible={visible} setVisible={setVisible} style={{ paddingBottom: 48 }}>
            <div className="history-list">
                <Button
                    full
                    active={index === -1}
                    key='👻'
                    onClick={_ => setIndex(-1)}
                >目前</Button>
                {history.map((h, i) => (
                    <Button
                        full
                        active={index === i}
                        key={h.time.toString()}
                        onClick={_ => setIndex(i)}>
                        {h.time.toTimeString().slice(0, 8)}
                    </Button>
                )).reverse()}
            </div>
            <div className="history-preview">
                <ReadOnlySlateEditor value={value} setValue={setValue}>
                    <div></div>
                </ReadOnlySlateEditor>
            </div>
            <div style={{ position: 'absolute', right: 24, bottom: 0, width: 100 }}>
                <Button
                    disabled={index === -1}
                    full
                    onClick={_ => {
                        setVisible(false);
                        setSlateValue(value);
                        dispatch({
                            type: ActionTypes.PUSH_MEMORY,
                            callback: { children: () => editor.children }
                        })
                    }}
                    type="primary"
                >回溯</Button>
            </div>
        </Dialog>
    )
});

const ExtraToolbar = ({ readOnly, setSlateValue }) => {
    const [leafStlyeDialogVisible, setLeafStlyeDialogVisible] = useState();
    const [saveLeafStlyeDialogVisible, setSaveLeafStlyeDialogVisible] = useState();
    const [tableStyleDialogVisible, setTableStyleDialogVisible] = useState();
    const [historyDialogVisible, setHistoryDialogVisible] = useState();

    const [leafStyleCache, setLeafStyleCache] = useState();

    return (
        <>
            <div className={`editor-toolbar${readOnly ? ' editor-toolbar-disabled' : ''}`}>
                <Button className="editor-button" onMouseDown={e => {
                    e.preventDefault();
                    setLeafStlyeDialogVisible(true);
                }}>
                    <AppstoreAddOutlined />
                </Button>
                <Button className="editor-button" onMouseDown={e => {
                    e.preventDefault();
                    setTableStyleDialogVisible(true);
                }}>
                    <AppstoreAddOutlined />
                </Button>
                <Button className="editor-button" onMouseDown={e => {
                    // NOTE: SELECTION
                    window.getSelection().removeAllRanges();
                    setHistoryDialogVisible(true);
                }}>
                    <HistoryOutlined />
                </Button>
            </div>
            <LeafStlyeDialog
                visible={leafStlyeDialogVisible}
                setVisible={setLeafStlyeDialogVisible}
                onApply={leafStyle => {
                    setLeafStyleCache(leafStyle);
                    setSaveLeafStlyeDialogVisible(true);
                }}
            />
            <SaveLeafStyleDialog
                visible={saveLeafStlyeDialogVisible}
                setVisible={setSaveLeafStlyeDialogVisible}
                onApply={(title, group) => {
                    mockedCustomStyles.push({ title, group, style: leafStyleCache });
                    setLeafStlyeDialogVisible(false);
                }}
            />
            <TableStyleDialog
                visible={tableStyleDialogVisible}
                setVisible={setTableStyleDialogVisible}
            />
            <HistoryDialog setSlateValue={setSlateValue} visible={historyDialogVisible} setVisible={setHistoryDialogVisible} />
        </>
    );
};

export default ExtraToolbar;