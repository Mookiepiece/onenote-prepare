import React, { useState, useEffect } from 'react';
import { Transforms, Editor } from 'slate';
import { useSlate } from 'slate-react';
import {
    ApiOutlined,
    HighlightOutlined,
    ClearOutlined
} from '@ant-design/icons';

import { TinyEmitter, EVENTS } from '@/utils/index';
import Button from "@/components/Button";
import Dialog from '@/components/Dialog';
import { SlateEditor } from '@/components/Editor';
import { Switch } from '@/components/Switch';

import { alt } from '@/utils';
import StylePickerDialog from '@/components/Editor/StylePickerDialog';
import { Divider } from '@/components/ColorPicker/Divider';
import { DropdownButtonSelect } from '@/components/DropdownButton';

const ResultPanel = ({ result, onResultChange }) => {
    const [dialogVisible, setDialogVisible] = useState(false);

    const [value, setValue] = useState(result.nodes);

    useEffect(_ => {
        !dialogVisible && onResultChange(alt.set(result, 'nodes', value));
    }, [dialogVisible]);

    return (
        <div className="content-result" >
            <span>替换结果:</span>
            <Button
                type={!result.options.clear ? 'primary' : undefined}
                onClick={_ => { onResultChange(alt.merge(result, `options`, { clear: false })); setDialogVisible(true); }}
            ><HighlightOutlined /></Button>
            <Button
                type={result.options.clear ? 'primary' : undefined}
                onClick={_ => onResultChange(alt.merge(result, `options`, { clear: !result.options.clear }))}
            ><ClearOutlined /></Button>
            <Dialog full visible={dialogVisible} setVisible={setDialogVisible} >
                <div className="result-editor-dialog">
                    <SlateEditor value={value} setValue={setValue}>
                        <Aside result={result} onResultChange={onResultChange} />
                    </SlateEditor>
                </div>
            </Dialog>

        </div>
    )
}

const Aside = ({ result, onResultChange }) => {
    const [stylePickerDialogVisible, setStylePickerDialogVisible] = useState();
    const [tabDividerDialogVisible, setTabDividerDialogVisible] = useState();
    const [tabPickerDialogVisible, setTabPickerDialogVisible] = useState();

    const [callback, setCallback] = useState([_ => _]);
    const [callback0, setCallback0] = useState([_ => _]);

    const showStyleDialog = (cb) => {
        setStylePickerDialogVisible(true);
        setCallback([cb]);
    };
    const showTabPickerDialog = (cb) => {
        setTabPickerDialogVisible(true);
        setCallback0([cb]);
    };

    useEffect(_ => {
        TinyEmitter.on(EVENTS.TRANSFORM_PLACEHOLDER_ELEMENT_STYLE, showStyleDialog);
        return _ => TinyEmitter.off(EVENTS.TRANSFORM_PLACEHOLDER_ELEMENT_STYLE, showStyleDialog);
    }, []);

    useEffect(_ => {
        TinyEmitter.on(EVENTS.TRANSFORM_PLACEHOLDER_ELEMENT_MIRROR, showTabPickerDialog);
        return _ => TinyEmitter.off(EVENTS.TRANSFORM_PLACEHOLDER_ELEMENT_MIRROR, showTabPickerDialog);
    }, []);


    return (
        <aside>
            <ExtraToolbar />
            <div className="form-like">
                <span>样式覆盖</span>
                <Switch
                    value={result.options.overrideStyle}
                    onChange={v => onResultChange(alt.merge(result, `options`, { overrideStyle: v }))}
                />
                <span>Tab切分</span>
                <Button onClick={_ => setTabDividerDialogVisible(true)}>设置</Button>
            </div>
            <TabDividerDialog
                onApply={v => onResultChange(alt.merge(result, `options`, { dividers: v }))}
                visible={tabDividerDialogVisible}
                setVisible={setTabDividerDialogVisible}
            />
            <TabPickerDialog
                onApply={callback0[0]}
                visible={tabPickerDialogVisible}
                setVisible={setTabPickerDialogVisible}
            />
            <StylePickerDialog
                onApply={callback[0]}
                visible={stylePickerDialogVisible}
                setVisible={setStylePickerDialogVisible}
            />
        </aside>
    )
}

const TabDividerDialog = ({ visible, setVisible, onApply }) => {
    const [value, setValue] = useState([]);

    return (
        <Dialog visible={visible} setVisible={setVisible}>
            <Divider value={value} onChange={setValue} />
            <Button
                type='primary'
                onClick={_ => {
                    setVisible(false);
                    onApply(value);
                }}
            >提交</Button>
        </Dialog>
    )
}

const TabPickerDialog = ({ visible, setVisible, onApply }) => {
    const [value, setValue] = useState([]);

    return (
        <Dialog visible={visible} setVisible={setVisible}>
            <DropdownButtonSelect
                value={value}
                width={80}
                dropdownWidth={80}
                options={Array(10).fill(0).map((_, v) => ({ label: v, value: v }))}
                onChange={setValue}
            />
            <Button onClick={_ => {
                setVisible(false);
                onApply(value)
            }}>提交</Button>
        </Dialog>
    )
}

const ExtraToolbar = () => {
    const editor = useSlate();

    return (
        <>
            <div className="editor-toolbar">
                <Button className="editor-button"
                    onMouseDown={e => {
                        e.preventDefault();
                        insertTransformPlaceholder(editor);
                    }}>
                    <ApiOutlined />
                </Button>
            </div>
        </>
    );
};

const insertTransformPlaceholder = (editor) => {
    Transforms.insertNodes(editor, { type: 'transform-placeholder', meta: { mirror: 0 }, children: [{ text: '' }] });
};

export default ResultPanel;