import React, { useState, useEffect } from 'react';
import './style.scss';

import Aside from './components/Aside';
import { SlateEditor, ReadOnlySlateEditor } from '@/components/Editor';
import ActionTypes from '@/redux/actions';
import { deepCopy } from '@/utils';

import { connect } from 'react-redux';

const Workbench = ({ state, dispatch }) => {
    const [value, setValue] = useState(initialValue);
    const [value1, setValue1] = useState(initialValue);

    let shouldDelete = !!(state.v && state.v.shouldDelete)
    useEffect(_ => {
        if (shouldDelete) {
            dispatch((dispatch, getState) => {
                setTimeout(_ => dispatch({ type: ActionTypes.APPLY_FINISH }), 0); // FIXME: how to know slate transform complete
            });
        }
    }, [shouldDelete]);

    const readOnly = state.v !== null;
    useEffect(_ => {
        if (shouldDelete) return;
        if (readOnly) {
            setValue1(deepCopy(value));
        } else {
            setValue(deepCopy(value1));
        }
    }, [shouldDelete, readOnly]);

    return (
        <div className="workbench">
            <SlateEditor showToolbar readOnly={readOnly} value={readOnly ? value1 : value} setValue={readOnly ? setValue1 : setValue}>
                <Aside readOnly={readOnly} setSlateValue={readOnly ? setValue1 : setValue} />
            </SlateEditor>
        </div>
    );
}

const mapStateToProps = (state) => ({
    state: state.workbenchAside
});

export default connect(mapStateToProps)(Workbench);

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