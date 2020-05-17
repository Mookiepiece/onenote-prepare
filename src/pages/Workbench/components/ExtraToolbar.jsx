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
import Button from "@/components/Button";
import Input from '@/components/Input';

import { alt, deepCopy, TinyEmitter, EVENTS } from '@/utils';
import { connect } from 'react-redux';

import { renderLeaf as Leaf } from '@/components/Editor/createEditor';

import { Switch, CheckboxButton } from '@/components/Switch';
import { setArrayItem, drawImageScaled } from '@/utils';
import { DropdownButton, DropdownButtonSelect } from '@/components/DropdownButton';
import { useIdbCustomStyles, useIdbCustomTableStyles, customTransforms, useIdbCustomTransforms } from '@/utils/userSettings';
import { MFind } from '../transforms';
import { Editor } from 'slate';
import ActionTypes from '@/redux/actions';
import { v4 as uuid } from 'uuid';
import StylePickerDialog from '@/components/Editor/StylePickerDialog';
import { computeStyleTable } from '@/components/Editor/Toolbar';
import { LeafStyleDialogWithStraw, fromComputedLeafStyle } from '@/pages/StyleCollection/components/LeafStyleDialog';
import { AdvancedTableStyleDialog } from '@/pages/StyleCollection/components/TableStyleDialog';
import { useReState } from '@/utils/hooks';

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
            <div className="dialog-bottom-panel">
                <Button
                    disabled={index === -1}
                    style={{ inlineSize: '160px' }}
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
    const [value, setValue, resetValue] = useReState([{ children: [{ text: '' }] }]);
    const [index, setIndex, resetIndex] = useReState(-1);

    const [customTransforms, setCustomTransforms] = useIdbCustomTransforms();

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
            <div className="dialog-bottom-panel">
                <Button
                    style={{ inlineSize: '160px' }}
                    disabled={index === -1}
                    onClick={_ => {
                        setCustomTransforms(customTransforms.slice(0, index).concat(customTransforms.slice(index + 1)));
                        resetIndex();
                        resetValue();
                    }}
                >删除</Button>
                <Button
                    style={{ inlineSize: '160px' }}
                    disabled={index === -1}
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
        </Dialog>
    )
}

const ExtraToolbar = ({ readOnly, setSlateValue }) => {
    const [leafStyleDialogVisible, setLeafStyleDialogVisible] = useState();
    const [leafStyleDialogValue, setLeafStyleDialogValue] = useState(fromComputedLeafStyle({}));

    const [tableStyleDialogVisible, setTableStyleDialogVisible] = useState();
    const [historyDialogVisible, setHistoryDialogVisible] = useState();
    const [addQuickTransformDialogVisible, setAddQuickTransformDialogVisible] = useState();

    const [leafStyleInfo, setLeafStyleInfo] = useState({ title: '', group: '' });

    const [customStyles, setCustomStyles] = useIdbCustomStyles();
    const [customTableStyles, setCustomTableStyles] = useIdbCustomTableStyles();
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
            <AdvancedTableStyleDialog
                visible={tableStyleDialogVisible}
                setVisible={setTableStyleDialogVisible}
                onApply={v => {
                    setCustomTableStyles([...customTableStyles, v]);
                }}
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