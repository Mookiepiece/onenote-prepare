import React, { useCallback, useMemo, useState } from 'react';
import { Editable, withReact, Slate } from 'slate-react';
import './style.scss';

import Editor from '@/components/Editor';

const Workbench = () => {
    return (
        <>
            <div className="workbench">
                <Editor initialValue={initialValue} renderAside={_=><div><p>hahah</p></div>} />
            </div>
        </>
    )
}


const initialValue = [
    {
        align: 'right',
        children: [
            {
                fontFamily: '等线',
                fontSize: 16,
                text:
                    'Since the editor is based on a recursive tree model, similar to an HTML document, you can create complex nested structures, like tables:',
            },
        ],
    },
];

export default Workbench