import React, { useMemo, useState } from 'react';
import { Editable, Slate } from 'slate-react';

import Toolbar from './Toolbar';
import { createEditor, renderElement, renderLeaf, createNoHistoryEditor } from './createEditor.js';
import higherOrderKeydownHandler from './hotkeys';
import Dialog from '../Dialog';
import Button from '../MkButton';
import { QuestionOutlined } from '@ant-design/icons';

export const SlateEditor = ({ value, setValue, readOnly, showToolbar, children }) => {
    const editor = useMemo(createEditor, []);

    const [debug, setDebug] = useState(false);

    const handleKeydown = readOnly ? undefined : event => higherOrderKeydownHandler(editor)(event);

    const toolbar = readOnly ? (showToolbar ? <Toolbar readOnly /> : null) : <Toolbar />

    return (
        <Slate editor={editor} value={value} onChange={value => setValue(value)}>
            <div className="slate">
                {toolbar}
                <Editable
                    readOnly={readOnly}
                    className="slate-editable"
                    renderElement={renderElement}
                    renderLeaf={renderLeaf}
                    placeholder="Enter some rich text…"
                    onKeyDown={handleKeydown}
                />
                <Button onClick={_ => setDebug(true)} style={{ alignSelf: 'start' }} >
                    <QuestionOutlined />
                </Button>
                <Dialog visible={debug} setVisible={setDebug}>
                    <div style={{ whiteSpace: 'pre-wrap' }}>
                        {JSON.stringify(value, null, 4)}
                    </div>
                </Dialog>
            </div>
            {children}
        </Slate>
    )
}

export const ReadOnlySlateEditor = ({ value, setValue, showToolbar = false, children }) => {
    const editor = useMemo(createNoHistoryEditor, []);
    const [debug, setDebug] = useState(false);

    return (
        <Slate editor={editor} value={value} onChange={value => setValue(value)}>
            <div className="slate">
                {showToolbar ? <Toolbar readOnly /> : null}
                <Editable
                    readOnly
                    className="slate-editable"
                    renderElement={renderElement}
                    renderLeaf={renderLeaf}
                />
                <Button onClick={_ => setDebug(true)} style={{ alignSelf: 'start' }} >
                    <QuestionOutlined />
                </Button>
                <Dialog visible={debug} setVisible={setDebug}>
                    <div style={{ whiteSpace: 'pre-wrap' }}>
                        {JSON.stringify(value, null, 4)}
                    </div>
                </Dialog>
            </div>
            {children}
        </Slate>
    )
}

