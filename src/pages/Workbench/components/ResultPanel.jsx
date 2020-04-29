import React, { useState, useEffect } from 'react';
import { Transforms, Editor } from 'slate';
import { useSlate } from 'slate-react';
import {
    ApiOutlined,
    HighlightOutlined,
    ClearOutlined
} from '@ant-design/icons';

import { TinyEmitter, EVENTS } from '@/utils/index';
import Button from "@/components/MkButton";
import Dialog from '@/components/Dialog';
import { SlateEditor } from '@/components/Editor';
import { Switch } from '@/components/Switch';

import { alt } from '@/utils';
import StylePickerDialog from './StylePickerDialog';

const ResultPanel = ({ result, onResultChange }) => {
    const [dialogVisible, setDialogVisible] = useState(false);

    const [value, setValue] = useState([
        {
            children: [
                { text: '' },
                {
                    type: 'transform-placeholder',
                    meta: { mirror: 'ORIGIN' },
                    children: [{ text: '' }]
                },
                { text: '' }
            ]
        }]);

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

    const [m, sm] = useState([_ => _]);

    const showStyleDialog = (cb) => {
        setStylePickerDialogVisible(true);
        sm([cb]);
    };

    useEffect(_ => {
        TinyEmitter.on(EVENTS.TRANSFORM_PLACEHOLDER_ELEMENT_CLICK, showStyleDialog);
        return _ => TinyEmitter.off(EVENTS.TRANSFORM_PLACEHOLDER_ELEMENT_CLICK, showStyleDialog);
    }, []);

    return (
        <aside>
            <ExtraToolbar />
            <div className="form-like">
                <span>覆盖原文样式（仅文字匹配）</span>
                <Switch
                    value={result.options.overrideStyle}
                    onChange={v => onResultChange(alt.merge(result, `options`, { overrideStyle: v }))}
                />
            </div>
            <StylePickerDialog
                onApply={m[0]}
                visible={stylePickerDialogVisible}
                setVisible={setStylePickerDialogVisible}
            />
        </aside>
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
    Transforms.insertNodes(editor, { type: 'transform-placeholder', meta: { mirror: 'ORIGIN' }, children: [{ text: '' }] });
};

export default ResultPanel;