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
        <>
            {/* <div className="workbench"> */}
            <div className="slate">
                <Slate editor={editor} value={value} onChange={value => setValue(value)}>
                    <Toolbar />
                    <Editable
                        renderElement={renderElement}
                        renderLeaf={renderLeaf}
                        placeholder="Enter some rich text…"
                        onKeyDown={handleKeydown}
                    />
                    <Aside setSlateValue={setValue} />
                </Slate>
                <p>{JSON.stringify(value)}</p>
            </div>
            {/* </div> */}
        </>
    )
}

export default Editor;