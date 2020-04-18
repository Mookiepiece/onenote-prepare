import React, { useState, useEffect, useCallback } from 'react';
import { Transforms } from 'slate';
import { useSlate } from 'slate-react';
import {
    ApiOutlined,
    BookOutlined,
} from '@ant-design/icons';

import { TinyEmitter } from '@/utils/index';
import Button from "@/components/MkButton";
import Dialog from '@/components/Dialog';
import SlateEditor from '@/components/Editor';
import { Switch } from '@/components/Switch';

import { mockedCustomStyles } from '@/utils/userSettings';
import { alt } from '@/utils';

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
            {/* {
                typeof v.result === 'string' ?
                    <Input value={v.result} onChange={onChange} />
                    : null
            } */}
            <Button className="add-match-button" onClick={_ => setDialogVisible(true)} ><BookOutlined /></Button>
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
    // const [switchValue, setSwitchValue] = useState(false);
    const editor = useSlate();

    const [stylePickerDialogVisible, setStylePickerDialogVisible] = useState();

    const [path, setPath] = useState(null);

    const showStyleDialog = ([node, path]) => {
        setStylePickerDialogVisible(true);
        setPath(path);
    };

    useEffect(_ => {
        TinyEmitter.on('TPEclick', showStyleDialog);
        return _ => TinyEmitter.off('TPEclick', showStyleDialog);
    }, []);

    return (
        <aside>
            <ExtraToolbar />
            {/* <span>输入多行</span><Switch value={switchValue} onChange={setSwitchValue} /> */}
            <span>完全覆盖原样式</span><Switch value={result.options.overrideStyle} onChange={v => onResultChange(alt.merge(result, `options`, { overrideStyle: v }))} />
            <StylePickerDialog
                onApply={
                    index => {
                        Transforms.setNodes(editor, {
                            meta: {
                                style: mockedCustomStyles[index].style,
                                mirror: 'ORIGIN'
                            }
                        }, {
                            at: path
                        });
                        setStylePickerDialogVisible(false);
                    }
                }
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
                <Button className="editor-button" onMouseDown={e => {
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

const StylePickerDialog = ({ visible, setVisible, onApply }) => {

    return (
        <Dialog full visible={visible} setVisible={setVisible}>
            <div className="dialog-style-picker">
                {
                    mockedCustomStyles.map((l, i) => (<LeafStyleCard key={i} leafStyle={l} onClick={_ => onApply(i)} />))
                }
            </div>
        </Dialog>
    )
};

const LeafStyleCard = ({ leafStyle, onClick }) => {
    return (
        <div className="leaf-style-card" onClick={onClick}>
            <div></div>
            <h6>{leafStyle.title}</h6>
            <p>{leafStyle.desc}</p>
        </div>
    )
}

export default ResultPanel;