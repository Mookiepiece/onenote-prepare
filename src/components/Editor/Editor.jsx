import React, { useMemo, useState } from 'react';
import { Editable, Slate } from 'slate-react';

import Toolbar from './Toolbar';
import { createEditor, renderElement, renderLeaf, createNoHistoryEditor } from './createEditor.js';
import higherOrderKeydownHandler from './hotkeys';
import Dialog from '../Dialog';

export const SlateEditor = ({ value, setValue, children }) => {
    const editor = useMemo(createEditor, []);

    const [debug, setDebug] = useState(false);

    const handleKeydown = event => higherOrderKeydownHandler(editor)(event);

    return (
        <Slate editor={editor} value={value} onChange={value => setValue(value)}>
            <div className="slate">
                <Toolbar />
                <Editable
                    className="slate-editable"
                    renderElement={renderElement}
                    renderLeaf={renderLeaf}
                    placeholder="Enter some rich text…"
                    onKeyDown={handleKeydown}
                />
                <input type="checkbox" value={debug} onChange={_ => setDebug(true)} />
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
            <div className="slate slate-disabled">
                {showToolbar ? <Toolbar /> : null}
                <Editable
                    readOnly
                    className="slate-editable"
                    renderElement={renderElement}
                    renderLeaf={renderLeaf}
                />
                <input type="checkbox" value={debug} onChange={_ => setDebug(true)} />
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

