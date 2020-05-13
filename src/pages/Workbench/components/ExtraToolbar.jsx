import React, { useState, useEffect, useRef } from 'react';
import {
    AppstoreAddOutlined,
    EditOutlined,
    HistoryOutlined,
    PlusOutlined,
    UpOutlined,
    DownOutlined,
    CloseOutlined,
    FormOutlined,
    FolderOpenOutlined,
    BuildOutlined
} from '@ant-design/icons';
import { useSlate } from 'slate-react';
import { ReadOnlySlateEditor } from '@/components/Editor';

import Dialog from "@/components/Dialog";
import Button from "@/components/MkButton";
import Input from '@/components/Input';

import { alt, deepCopy, TinyEmitter, EVENTS } from '@/utils';
import { connect } from 'react-redux';

import { renderLeaf as Leaf } from '@/components/Editor/createEditor';

import { Switch, CheckboxButton } from '@/components/Switch';
import { setArrayItem, drawImageScaled } from '@/utils';
import { DropdownButton, DropdownButtonSelect } from '@/components/DropdownButton';
import { fontFamilyOptions, SLATE_DEFAULTS, fontSizeOptions, useIdbCustomStyles, pushCustomTableStyle, customTransforms } from '@/utils/userSettings';
import { MFind } from '../transforms';
import { Editor } from 'slate';
import ActionTypes from '@/redux/actions';
import { v4 as uuid } from 'uuid';
import CachedInput from '@/components/Input/cachedInput';
import StylePickerDialog from '@/components/Editor/StylePickerDialog';
import { computeStyleTable } from '@/components/Editor/Toolbar';
import { LeafStyleDialogWithStraw, fromStyle, LeafStyleDialogNoInput } from '@/pages/StyleCollection/components/LeafStyleDialog';
import { ColorPickerButton } from '@/components/ColorPicker';
const TableStylePreview = ({ rules }) => {
    const [tableRows, setTableRows] = useState(5);
    const [tableCols, setTableCols] = useState(5);

    const computedStyleTable = computeStyleTable(rules, tableRows, tableCols);

    return (
        <div className="sample-container slate-normalize">
            <div className="table-style-preview-configs">
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
            </div>
            <table>
                <tbody>
                    {
                        Array(tableRows).fill(0).map((_, r) => (
                            <tr key={r}>
                                {Array(tableCols).fill(0).map((_, c) => {
                                    const { cellColor, style } = computedStyleTable[r][c];
                                    return (
                                        <td key={c} style={{ background: cellColor }}>
                                            <Leaf leaf={style ? style : {}}>单元</Leaf>
                                        </td>
                                    )
                                })}
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </div>
    )
}

const TableStyleDialog = ({ visible, setVisible }) => {
    const [rules, setRules] = useState([]);

    const [leafStyleDialogVisible, setLeafStyleDialogVisible] = useState(false);
    const [stylePickerDialogVisible, setStylePickerDialogVisible] = useState(false);
    const [leafStyleDialogValue, setLeafStyleDialogValue] = useState(fromStyle({}));

    const [leafStyleDialogOnApplyIndex, setLeafStyleDialogOnApplyIndex] = useState([_ => _]);
    const [saveTableStyleDialogVisible, setSaveTableStyleDialogVisible] = useState(false);

    const computedRules = rules.map(({ inputs, bg }) => ({
        target: [inputs.mode, inputs.inputs0, inputs.inputs1],
        cellColor: inputs.cellColor[0] ? inputs.cellColor[1] : null,
        style: inputs.style[0] ? inputs.style[1] : null
    }));

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
                                }
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
                                        <div className="form-like" style={{ '--grid-template-columns': '100px 40px 100px' }}>
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
                                                        setStylePickerDialogVisible(true);
                                                        setLeafStyleDialogOnApplyIndex(i);
                                                    }}>
                                                    <Leaf leaf={{ ...rule.inputs.style[1], fontSize: undefined }}>T</Leaf>
                                                </Button>
                                                <Button
                                                    disabled={!rule.inputs.style[0]}
                                                    onClick={_ => {
                                                        setLeafStyleDialogVisible(true);
                                                        setLeafStyleDialogOnApplyIndex(i);
                                                    }}>
                                                    <FormOutlined />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </aside>
                <TableStylePreview rules={computedRules} />
                <StylePickerDialog
                    visible={stylePickerDialogVisible}
                    setVisible={setStylePickerDialogVisible}
                    onApply={(i, v) => { setLeafStyleDialogValue(fromStyle(v.style)); setLeafStyleDialogVisible(true) }}
                />
                <LeafStyleDialogNoInput
                    visible={leafStyleDialogVisible}
                    setVisible={setLeafStyleDialogVisible}
                    onApply={(v) => setRules(alt.set(rules, `${leafStyleDialogOnApplyIndex}.inputs.style.1`, v))}

                    customLeafStyle={leafStyleDialogValue}
                    setCustomLeafStyle={setLeafStyleDialogValue}
                />
            </div>
            <div style={{ inlineSize: '160px' }}>
                <Button
                    disabled={!rules.length}
                    full
                    onClick={_ => setSaveTableStyleDialogVisible(true)}
                    type="primary"
                >保存</Button>
            </div>
            <SaveTableStyleDialog
                visible={saveTableStyleDialogVisible}
                setVisible={setSaveTableStyleDialogVisible}
                onApply={(title, group, image) => {
                    pushCustomTableStyle({
                        title,
                        group,
                        image,
                        rules: computedRules
                    });
                    setVisible(false);
                }}
            />
        </Dialog>
    )
}

const BLANK = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQYV2NgAAIAAAUAAarVyFEAAAAASUVORK5CYII='

const imagineThis = (src, canvas, callback) => {
    let img = new Image();
    img.src = URL.createObjectURL(src);
    img.onload = _ => {
        drawImageScaled(img, canvas.current.getContext('2d'));
        callback(canvas.current.toDataURL('image/png', .5));
        URL.revokeObjectURL(src);
    };
}

const ImageInput = ({ emit }) => {
    const [cleard, setCleard] = useState(true);
    const [file, setFile] = useState(null);
    const canvas = useRef();
    const button = useRef();

    useEffect(_ => {
        if (file) {
            imagineThis(file, canvas, emit);
            setCleard(false);
        }
    }, [file]);

    return (
        <div className="image-input" style={{ position: 'relative' }}>
            <div
                role="button"
                ref={button}
                className="image-input-button"
                tabIndex="0"
                onPaste={e => {
                    const src = e.clipboardData.files[0];
                    if (!src || !src.type.startsWith('image'))
                        return;

                    imagineThis(src, canvas, emit);
                    setCleard(false);
                }}
                onClick={_ => {
                    if (!cleard) {
                        canvas.current.getContext('2d').clearRect(0, 0, 200, 200);
                        setCleard(true);
                    } else {
                        button.current.focus();
                        document.execCommand('paste');
                    }
                }}
            ></div>

            <div><PlusOutlined /></div>
            <canvas
                tabIndex="0"
                width="200"
                height="200"
                style={{ width: 200, height: 200 }}
                ref={canvas}
            > NOTE: 👴の surface 200% scaled</canvas>
            {
                cleard ? <FileInput type="file" onChange={setFile} /> : null
            }
            <span>{cleard ? '点击粘贴剪贴板图片' : '点击清除图片'}</span>
        </div>
    )
}

// https://medium.com/trabe/controlled-file-input-components-in-react-3f0d42f901b8
const FileInput = ({ value, onChange = _ => _, ...rest }) => {
    const input = useRef();
    return (
        <div className="file-input">
            <div>
                {value ? `已选文件: ${value.name}` : '来自文件'}
            </div>
            <label>
                <Button onClick={_ => input.current.click()}><FolderOpenOutlined /></Button>
                <input
                    ref={input}
                    {...rest}
                    style={{ display: "none" }}
                    type="file"
                    multiple={false}
                    accept='image/*'
                    onChange={e => {
                        onChange(e.target.files[0]);
                    }}
                />
            </label>
        </div>
    )
}

const SaveTableStyleDialog = ({ visible, setVisible, rules, onApply }) => {
    const [title, setTitle] = useState('');
    const [group, setGroup] = useState('');
    const [image, setImage] = useState(BLANK);

    return (
        <Dialog visible={visible} setVisible={setVisible}>
            <p>新建表格样式</p>
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
                <span>图片</span>
                <div>
                    <ImageInput emit={setImage} />
                </div>
            </div>
            <Button disabled={!title.trim() || !group.trim()} onClick={_ => {
                setTitle('');
                setGroup('');
                setImage(BLANK);

                onApply(title, group, image);
                setVisible(false);
            }} full>保存</Button>
        </Dialog>
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
        <Dialog fullWidth visible={visible} setVisible={setVisible} paddingBottom={'64px'}>
            <div className="history-container">
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
            </div>
            <div style={{ inlineSize: '160px' }}>
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

const AddQuickTransformDialog = ({ visible, setVisible }) => {
    const [value, setValue] = useState([{ children: [{ text: '' }] }]);
    const [index, setIndex] = useState(-1);

    useEffect(_ => {
        if (index === -1) {
            setValue(deepCopy([{ children: [{ text: '' }] }]));
        } else {
            setValue(deepCopy(customTransforms[index].value.result.nodes));
        }
    }, [index]);

    return (
        <Dialog fullWidth visible={visible} setVisible={setVisible} paddingBottom={'64px'}>
            <div className="history-container">
                <div className="history-list">
                    {customTransforms.map((t, i) => (
                        <Button
                            full
                            active={index === i}
                            key={i}
                            onClick={_ => setIndex(i)}>
                            {t.title}
                        </Button>
                    )).reverse()}
                </div>
                <div className="history-preview">
                    <ReadOnlySlateEditor value={value} setValue={setValue}>
                        <div></div>
                    </ReadOnlySlateEditor>
                </div>
            </div>
            <div style={{ inlineSize: '160px' }}>
                <Button
                    disabled={index === -1}
                    full
                    onClick={_ => {
                        setVisible(false);
                        TinyEmitter.emit(EVENTS.PREPARED_TRANSFORM, {
                            value: {
                                ...MFind(customTransforms[index].value.id),
                                inputs: customTransforms[index].value.inputs
                            },
                            result: customTransforms[index].value.result,
                        });
                    }}
                    type="primary"
                >确定</Button>
            </div>
        </Dialog >
    )
}

const ExtraToolbar = ({ readOnly, setSlateValue }) => {
    const [leafStyleDialogVisible, setLeafStyleDialogVisible] = useState();
    const [leafStyleDialogValue, setLeafStyleDialogValue] = useState(fromStyle({}));

    const [tableStyleDialogVisible, setTableStyleDialogVisible] = useState();
    const [historyDialogVisible, setHistoryDialogVisible] = useState();
    const [addQuickTransformDialogVisible, setAddQuickTransformDialogVisible] = useState();

    const [leafStyleInfo, setLeafStyleInfo] = useState({ title: '', group: '' });

    const [customStyles, setCustomStyles] = useIdbCustomStyles();

    return (
        <>
            <div className={`editor-toolbar${readOnly ? ' editor-toolbar-disabled' : ''}`}>
                <Button className="editor-button" onMouseDown={e => {
                    e.preventDefault();
                    setLeafStyleDialogVisible(true);
                }}>
                    <AppstoreAddOutlined />
                </Button>
                <Button className="editor-button" onMouseDown={e => {
                    e.preventDefault();
                    setTableStyleDialogVisible(true);
                }}>
                    <AppstoreAddOutlined />
                </Button>
                <Button className="editor-button" onClick={e => {
                    // NOTE: SELECTION
                    window.getSelection().removeAllRanges();
                    setHistoryDialogVisible(true);
                }}>
                    <HistoryOutlined />
                </Button>

            </div>
            <div className={`editor-toolbar${readOnly ? ' editor-toolbar-disabled' : ''}`}>
                <Button className="editor-button" onClick={e => {
                    e.preventDefault();
                    setAddQuickTransformDialogVisible(true);
                }}>
                    <BuildOutlined />
                </Button>
            </div>
            <LeafStyleDialogWithStraw
                visible={leafStyleDialogVisible}
                setVisible={setLeafStyleDialogVisible}
                onApply={(title, group, style) => {
                    setCustomStyles([...customStyles, { title, group, style, id: uuid() }]);
                }}
                customLeafStyle={leafStyleDialogValue}
                setCustomLeafStyle={setLeafStyleDialogValue}
                info={leafStyleInfo}
                setInfo={setLeafStyleInfo}
            />
            <TableStyleDialog
                visible={tableStyleDialogVisible}
                setVisible={setTableStyleDialogVisible}
            />
            <HistoryDialog setSlateValue={setSlateValue} visible={historyDialogVisible} setVisible={setHistoryDialogVisible} />
            <AddQuickTransformDialog
                visible={addQuickTransformDialogVisible}
                setVisible={setAddQuickTransformDialogVisible}
            />
        </>
    );
};

export default ExtraToolbar;