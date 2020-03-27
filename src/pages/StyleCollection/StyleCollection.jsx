import React, { useCallback, useMemo, useState } from 'react';
import { Editable, withReact, Slate } from 'slate-react';
import './style.scss';

import Editor from '@/components/Editor';
import Button from '@/components/MkButton';
import Dialog from '@/components/Dialog';

import { Switch } from '@/components/Switch';

const SC = () => {
    const [dv, sdv] = useState(false);

    const [trible, setTrible] = useState(false);

    const handleChange = value => {
        setTrible(value);
    }

    const [leafStyle, setLeafStyle] = useState({
        fontFamily: undefined,
        fontSize: undefined,
        fontColor: undefined,
        bgColor: undefined,
        bold: undefined,
        italic: undefined,
        underline: undefined,
    });

    return (
        <div className="style-collection">
            <br />
            <br />
            <br />
            <br />

            <Button onClick={_ => sdv(true)}>sc</Button>
            <Switch
                value={trible}
                onChange={handleChange}
                activeColor='var(--purple-5)'
                reversed
            />
            <Dialog visible={dv} setVisible={sdv}>
                <div className="leaf-style-editor">
                    <pre><span>对照组</span></pre>
                    <span>文字样式示例</span>
                    <pre><span>对照组</span></pre>
                    <aside>

                    </aside>
                </div>
            </Dialog>
            {/* <Editor initialValue={initialValue} >
                <div><p>hahah</p></div>
            </Editor> */}
        </div>
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

export default SC;