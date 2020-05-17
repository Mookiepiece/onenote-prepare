import React, { useState, useEffect, useRef } from 'react';
import {
    PlusOutlined,
    UpOutlined,
    DownOutlined,
    CloseOutlined,
    FormOutlined,
    FolderOpenOutlined,
} from '@ant-design/icons';

import Dialog from "@/components/Dialog";
import Button from "@/components/Button";
import Input from '@/components/Input';

import { alt } from '@/utils';
import { useDeepState, useReState } from '@/utils/hooks';

import { renderLeaf as Leaf } from '@/components/Editor/createEditor';

import { Switch, CheckboxButton } from '@/components/Switch';
import { setArrayItem, drawImageScaled } from '@/utils';
import { DropdownButton, DropdownButtonSelect } from '@/components/DropdownButton';
import { v4 as uuid } from 'uuid';
import CachedInput from '@/components/Input/cachedInput';
import StylePickerDialog from '@/components/Editor/StylePickerDialog';
import { computeStyleTable } from '@/components/Editor/Toolbar';
import { fromComputedLeafStyle, LeafStyleDialogNoInput } from '@/pages/StyleCollection/components/LeafStyleDialog';
import { ColorPickerButton } from '@/components/ColorPicker';

import './tableStyleDialog.scss';

export const BLANK = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQYV2NgAAIAAAUAAarVyFEAAAAASUVORK5CYII='

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

const drawImageFileOnCanvas = (src, canvas, callback) => {
    let img = new Image();
    img.src = URL.createObjectURL(src);
    img.onload = _ => {
        drawImageScaled(img, canvas.current.getContext('2d'));
        callback(canvas.current.toDataURL('image/png', .5));
        URL.revokeObjectURL(src);
    };
}

const drawImageDataURLOnCanvas = (src, canvas, callback) => {
    let img = new Image();
    img.src = src;
    img.onload = _ => {
        drawImageScaled(img, canvas.current.getContext('2d'));
        callback(canvas.current.toDataURL('image/png', .5));
    };
}

const ImageInput = ({ value, emit }) => {
    const [cleard, setCleard] = useState(true);
    const [file, setFile] = useState(null);
    const canvas = useRef();
    const button = useRef();

    // initial value
    useEffect(_ => {
        if (value !== BLANK) {
            drawImageDataURLOnCanvas(value, canvas, emit);
            setCleard(false);
        }
    }, []);

    useEffect(_ => {
        if (file) {
            drawImageFileOnCanvas(file, canvas, emit);
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

                    drawImageFileOnCanvas(src, canvas, emit);
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

const SaveTableStyleDialog = ({ visible, setVisible, info, setInfo, onApply }) => {
    const [title, setTitle] = useDeepState(info, setInfo, 'title');
    const [group, setGroup] = useDeepState(info, setInfo, 'group');
    const [image, setImage] = useDeepState(info, setInfo, 'image');

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
                    <ImageInput value={image} emit={setImage} />
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

export const AdvancedTableStyleDialog = ({ visible, setVisible, onApply }) => {
    const [rules, setRules, resetRules] = useReState([]);
    const [info, setInfo, resetInfo] = useReState({
        title: '',
        group: '',
        image: BLANK
    });

    return (
        <BaseTableStyleDialog
            visible={visible}
            setVisible={setVisible}
            onApply={(...args) => {
                onApply(...args);
                resetRules();
                resetInfo();
            }}
            rules={rules}
            setRules={setRules}
            info={info}
            setInfo={setInfo} />
    )
}

export const fromComputedTableRules = (computedRules) => {
    return computedRules.map(rule => {
        const [mode, inputs0, inputs1] = rule.target;
        const { cellColor, style } = rule;

        return {
            id: uuid(),
            inputs: {
                inputs0,
                inputs1,
                mode,
                cellColor: cellColor === null ? [false, '#ddd'] : [true, cellColor],
                style: style === null ? [false, {}] : [true, style]
            }
        }
    })
}

export const BaseTableStyleDialog = ({ visible, setVisible, onApply, rules, setRules, info, setInfo }) => {
    const [leafStyleDialogVisible, setLeafStyleDialogVisible] = useState(false);
    const [stylePickerDialogVisible, setStylePickerDialogVisible] = useState(false);
    const [leafStyleDialogValue, setLeafStyleDialogValue] = useState(fromComputedLeafStyle({}));

    const [leafStyleDialogOnApplyIndex, setLeafStyleDialogOnApplyIndex] = useState([_ => _]);
    const [saveTableStyleDialogVisible, setSaveTableStyleDialogVisible] = useState(false);

    const computedRules = rules.map(({ inputs }) => ({
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
                    onApply={(i, v) => { setLeafStyleDialogValue(fromComputedLeafStyle(v.style)); setLeafStyleDialogVisible(true) }}
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
                    onApply({
                        title,
                        group,
                        image,
                        rules: computedRules
                    });
                    setVisible(false);
                }}
                info={info}
                setInfo={setInfo}
            />
        </Dialog>
    )
}