import React, { useMemo, useState } from 'react';
import { Editable, withReact, Slate } from 'slate-react';

import Toolbar from './Toolbar';
import { createEditor, renderElement, renderLeaf } from './createEditor.js';
import higherOrderKeydownHandler from './hotkeys';
import Dialog from '../Dialog/Dialog';

const Editor = ({ value, setValue, children }) => {
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
        </Slate >
    )
}

export default Editor;