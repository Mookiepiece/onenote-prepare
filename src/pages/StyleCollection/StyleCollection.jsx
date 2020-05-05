import React, { useMemo, useState } from 'react';
import { Editable, withReact, Slate } from 'slate-react';


import './style.scss';

import Button from '@/components/MkButton';
import { ColorPicker } from '@/components/ColorPicker';

import { DropdownButton } from '@/components/DropdownButton';

const SC = _ => {
    const [trible, setTrible] = useState('#dddd66');

    return (
        <div className="page-style-collection">
            <ColorPicker value={trible} onChange={setTrible} />

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