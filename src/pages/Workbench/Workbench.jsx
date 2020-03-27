import React, { useCallback, useMemo, useState } from 'react';
import { Editable, withReact, Slate } from 'slate-react';
import './style.scss';

import Aside from './components/Aside';
import Editor from '@/components/Editor';

const Workbench = () => {
    return (
        <div className="workbench">
            <Editor initialValue={initialValue} >
                <Aside />
            </Editor>
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
    {
        type: 'table',
        children: [
            {
                type: 'table-row',
                children: [
                    {
                        type: 'table-cell',
                        children: [
                            {
                                type: 'paragraph',
                                children: [
                                    {
                                        fontFamily: '等线',
                                        fontSize: 16,
                                        text: 'haha',
                                        bold: true
                                    }]
                            }
                        ],
                    },
                    {
                        type: 'table-cell',
                        children: [
                            {
                                type: 'paragraph',
                                children: [{
                                    fontFamily: '等线',
                                    fontSize: 16,
                                    text: 'wawa',
                                    bold: true
                                }]
                            }
                        ],
                    },
                    {
                        type: 'table-cell',
                        children: [
                            {
                                type: 'paragraph',
                                children: [{
                                    fontFamily: '微软雅黑',
                                    fontSize: 20,
                                    text: 'wawa',
                                    bold: true
                                }]
                            }
                        ],
                    },
                    {
                        type: 'table-cell',
                        children: [
                            {
                                type: 'paragraph',
                                children: [{ text: 'wawa', bold: true }]
                            }
                        ],
                    },
                ],
            },
            {
                type: 'table-row',
                children: [
                    {
                        type: 'table-cell',
                        children: [
                            {
                                type: 'paragraph',
                                children: [{ text: 'wawa', bold: true }]
                            }
                        ],
                    },
                    {
                        type: 'table-cell',
                        children: [
                            {
                                type: 'paragraph',
                                children: [{ text: 'wawa', bold: true }]
                            }
                        ],
                    },
                    {
                        type: 'table-cell',
                        children: [
                            {
                                type: 'paragraph',
                                children: [{ text: 'wawa', bold: true }]
                            }
                        ],
                    },
                    {
                        type: 'table-cell',
                        children: [
                            {
                                type: 'paragraph',
                                children: [{ text: 'wawa', bold: true }]
                            }
                        ],
                    },
                ],
            },
            {
                type: 'table-row',
                children: [
                    {
                        type: 'table-cell',
                        children: [
                            {
                                type: 'paragraph',
                                children: [{ text: '### of lives', bold: true }]
                            }
                        ],
                    },
                    {
                        type: 'table-cell',
                        children: [
                            {
                                type: 'paragraph',
                                children: [{ text: 'wawa', bold: true }]
                            }
                        ],
                    },
                    {
                        type: 'table-cell',
                        children: [
                            {
                                type: 'paragraph',
                                children: [{ text: 'wawa', bold: true }]
                            }
                        ],
                    },
                    {
                        type: 'table-cell',
                        children: [
                            {
                                type: 'paragraph',
                                children: [{ text: 'wawa', bold: true }]
                            }
                        ],
                    },
                ],
            },
        ],
    },
    {
        children: [
            {
                text:
                    "This table is just a basic example of rendering a table, and it doesn't have fancy functionality. But you could augment it to add support for navigating with arrow keys, displaying table headers, adding column and rows, or even formulas if you wanted to get really crazy!",
            },
        ],
    },
];

export default Workbench