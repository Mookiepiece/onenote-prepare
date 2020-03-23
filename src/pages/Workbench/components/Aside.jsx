import React, { useState, useReducer, useCallback, useMemo, useEffect } from 'react';
import { Transforms, Editor, Text, Range, Node, Path } from 'slate';
import { useSlate, useEditor } from 'slate-react';

import Button from "@/components/MkButton";
import Dialog from "@/components/Dialog";

import './style.scss';

import {
    CloseOutlined
} from '@ant-design/icons';

import { deepCopy, altArrayItem } from '@/utils';

import M from '../transforms';
import { applyMatch, clearUp } from '../transforms/sideEffects';

const useAsideState = (initialState, setSlateValue) => {
    const editor = useSlate();
    const [_state, setState] = useState(initialState);

    const applyChange = useCallback((state, index = state.currentIndex) => {
        state.v[index].match(editor, state.v[index].inputs);
        state.v[index].apply(editor, state.v[index].inputs);
        return {
            ...state,
            memory: [...state.memory, deepCopy(editor.children)]
        };
    }, []);

    const applyMatch = useCallback((state, index = state.currentIndex) => {
        clearUp();
        state.v[index].match(editor, state.v[index].inputs);
        return state;
    }, []);

    const currentState = useCallback(state => {
        if (state.memory.length > state.currentIndex + 1)
            return 'applied';
        else
            return 'current';
    }, []);

    let state = _state;

    const dispatch = action => setState((_ => {
        switch (action.type) {
            case 'DELETE':
                //TODO 
                return state;
            case 'PUSH': {
                if (state.currentIndex !== null && currentState(state) === 'current') {
                    state = applyChange(state);
                }

                return {
                    ...state,
                    v: [...state.v, { ...action.value, key: Date.now() }],
                    currentIndex: state.v.length,
                };
            }
            case 'INPUT':
                return {
                    ...state,
                    v: altArrayItem(state.v, action.index, {
                        inputs: {
                            ...state.v[action.index].inputs,
                            ...action.inputs
                        }
                    })
                };
            case 'TOGGLE_ACTIVE': {

                let index = action.index;

                if (index < state.currentIndex) {
                    //一步到位还原状态，
                    setSlateValue(state.memory[index]);
                    state = {
                        ...state,
                        currentIndex: index,
                        memory: [...state.memory].slice(0, index + 1)
                    };

                } else if (index === state.currentIndex) {
                    if (currentState(state) === "current") {
                        state = applyChange(state);
                        return state;
                    } else {
                        setSlateValue(state.memory[index]); //setSlateValue后无法激活match要下一个阶段激活 
                        state = {
                            ...state,
                            memory: [...state.memory].slice(0, index + 1)
                        };
                        return state;
                    }
                } else {
                    //逐步应用
                    if (currentState(state) === "current") {
                        state = applyChange(state);
                    }
                    for (let i = state.currentIndex + 1; i !== index; i++) {
                        state = applyChange(state, i);
                    }

                    state = {
                        ...state,
                        currentIndex: index,
                    }

                }
                // clearUp(); //TODO clear up here???
                return state;
            }
            case 'MATCH':
                state = applyMatch(state);
                return state;
            case 'APPLY':
                state = applyChange(state);
                return state;
            default:
                console.error('[pre-onenote] incorrent action type:', action.type);
                return state;
        }
    })());

    return [_state, dispatch];
}


//current 正在match，新建的话自动apply, apply已拥有
const Aside = ({ setSlateValue }) => {
    const editor = useSlate();
    const [dialogVisible, setDialogVisible] = useState();
    const [state, dispatch] = useAsideState({
        v: [],
        memory: [deepCopy(editor.children)],
        currentIndex: null,
    }, setSlateValue);

    //dupulicated
    const currentState = useCallback(state => {
        if (state.memory.length > state.currentIndex + 1)
            return 'applied';
        else
            return 'current';
    }, []);

    const handleClick = (i) => {
        dispatch({
            type: 'PUSH',
            value: M[i].get()
        });
        setDialogVisible(false);
    };

    return (
        <aside>
            <Button full onClick={_ => setDialogVisible(true)}>add rule</Button>

            {
                state.v.map((v, index) => (
                    <TransformFormularActivated
                        v={v}
                        onInput={inputs => dispatch({
                            type: 'INPUT',
                            index,
                            inputs
                        })}

                        key={v.key}

                        color={
                            ((() => {
                                if (index < state.currentIndex) {
                                    return 'applied';
                                } else if (index > state.currentIndex) {
                                    return 'unused';
                                } else {
                                    return currentState(state);
                                }
                            })())
                        }

                        onClose={_ => dispatch({
                            type: 'DELETE',
                            index
                        })}
                        onActive={
                            _ => dispatch({
                                type: 'TOGGLE_ACTIVE',
                                index
                            })
                        }
                        onMatch={
                            _ => dispatch({
                                type: 'MATCH',
                                index
                            })
                        }
                        onApply={
                            _ => dispatch({
                                type: 'APPLY',
                                index
                            })
                        }
                    />)
                ).reverse()
            }
            <Dialog visible={dialogVisible} setVisible={setDialogVisible}>
                <div className="dialog-select-transform">
                    {
                        M.map((m, i) => (<MatchCard key={i} match={m} onClick={_ => handleClick(i)} />))
                    }
                </div>
            </Dialog>
        </aside>
    )
}

const TransformFormularActivated = ({ v, color, onClose, onActive, onInput, onMatch, onApply }) => {
    let className = `transform-formular-activated-card${' ' + color}`;

    return (
        <div className={className}>
            <div className="title">
                <Button onClick={onClose}><CloseOutlined /></Button>
            </div>
            <div className="active-info" onMouseDown={onActive}></div>
            <div className="content"> {v.render({ color, inputs: v.inputs, onInput, onMatch, onApply })}</div>
        </div>
    )
}

const MatchCard = ({ match, onClick }) => {
    return (
        <div className="dialog-select-transform-option" onClick={onClick}>
            <div></div>
            <h6>{match.title}</h6>
            {/* <p>{match.desc}</p> */}
        </div>
    )
}

export default Aside;