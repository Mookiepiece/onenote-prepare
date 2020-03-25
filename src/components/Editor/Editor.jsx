import React, { useCallback, useMemo, useState } from 'react';
import { Editable, withReact, Slate } from 'slate-react';

import Toolbar from './Toolbar';
import { createEditor, renderElement, renderLeaf } from './createEditor.js';
import higherOrderKeydownHandler from './hotkeys';

const Editor = ({ initialValue, renderAside }) => {
    const [value, setValue] = useState(initialValue);
    const editor = useMemo(createEditor, []);
    const Aside = renderAside;

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
            </div>
            <Aside setSlateValue={setValue} />
        </Slate>
    )
}

export default Editor;