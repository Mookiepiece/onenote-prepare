import React, { useState, useReducer, useCallback, useMemo, useEffect } from 'react';
import { Transforms, Editor, Text, Range, Node, Path } from 'slate';
import {
    CSSTransition,
    TransitionGroup,
} from 'react-transition-group';
import { useSlate, useEditor } from 'slate-react';
import {
    CloseOutlined
} from '@ant-design/icons';
import { v4 as uuid } from 'uuid';

import Button from "@/components/MkButton";
import Input from '@/components/Input';

import './style.scss';

import { deepCopy, altArrayItem, setArrayItem, altObject, setObject } from '@/utils';

import { MGet } from '../transforms';
import { applyMatch, clearUp, applyRender } from '../transforms/sideEffects';

import DialogMatchPicker from './DialogMatchPicker';

let matchedRanges = [];

const useAsideState = (initialState, setSlateValue) => {
    const editor = useSlate();
    const [_state, _setState] = useState(initialState);

    const setState = v => {
        _setState(v);
    }

    const applyChange = useCallback((editor, state, index = state.currentIndex) => {
        applyMatcher(editor, state, index)
        applyRender(editor, state.v[index].result);
        return {
            ...state,
            memory: [...state.memory, deepCopy(editor.children)]
        };
    }, []);

    const applyMatcher = useCallback((editor, state, index = state.currentIndex) => {
        clearUp(editor);
        const v = state.v[index];
        const ranges = v.matches.reduce((prevRanges, v, i) => { return v.match(editor, matchedRanges, v.inputs) }, []);
        applyMatch(editor, ranges);
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
            case 'PUSH_MATCH_RULE': {
                if (action.pushTransform) { //如果是点击add transform 按钮，则要新建一个transform
                    if (state.currentIndex !== null && currentState(state) === 'current') { //save prev transform
                        state = applyChange(editor, state);
                    }
                    state = {
                        ...state,
                        v: [...state.v, { matches: [], currentMatch: null, result: '', key: uuid() }],
                        currentIndex: state.v.length,
                    }
                }

                let currentIndex = state.currentIndex;
                let v = state.v;
                let currentMatch = v[currentIndex].currentMatch;

                return {
                    ...state,
                    v: altArrayItem(v, currentIndex, {
                        matches: [...v[currentIndex].matches, {
                            ...action.value,
                            inputs: { ...action.value.inputs, title: action.value.title },
                            key: uuid()
                        }],
                        currentMatch: currentMatch === null ? 0 : currentMatch + 1
                    }),
                };
            }
            case 'SET_CURRENT_MATCH': {
                let currentIndex = state.currentIndex;
                console.log('set cur match', action.value);
                return {
                    ...state,
                    v: setObject(state.v, `${currentIndex}.currentMatch`, action.value)
                }
            }
            case 'INPUT': {
                let currentIndex = state.currentIndex;
                let v = state.v;
                let matchIndex = action.matchIndex; //-1 result >=0 matches

                if (matchIndex < 0) {
                    state = {
                        ...state,
                        v: setObject(v, `${currentIndex}.result`, action.inputs)
                    };
                } else {
                    state = {
                        ...state,
                        v: altObject(v, `${currentIndex}.matches.${matchIndex}.inputs`, action.inputs)
                    };
                    if (action.rematch) {
                        state = applyMatcher(editor, state);
                    }
                }
                return state;
            }
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
                        state = applyChange(editor, state);
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
                        state = applyChange(editor, state);
                    }
                    for (let i = state.currentIndex + 1; i !== index; i++) {
                        state = applyChange(editor, state, i);
                    }

                    state = {
                        ...state,
                        currentIndex: index,
                    }

                }
                return state;
            }
            case 'MATCH':
                console.log('applyMatcher');
                state = applyMatcher(editor, state);
                return state;
            case 'APPLY':
                state = applyChange(editor, state);
                return state;
            case 'SET_CURRENT_INDEX':
                return { ...state, currentIndex: action.index }
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
    const [state, dispatch] = useAsideState({
        v: [],
        memory: [deepCopy(editor.children)],
        currentIndex: null,
    }, setSlateValue);

    const [dialogVisible, setDialogVisible] = useState(false);
    const [dialogPushTransform, setDialogPushTransform] = useState(false);

    //dupulicated
    const currentState = useCallback(state => {
        if (state.memory.length > state.currentIndex + 1)
            return 'applied';
        else
            return 'current';
    }, []);

    const handleMatchSelected = (i) => {
        dispatch({
            type: 'PUSH_MATCH_RULE',
            value: MGet(i),
            pushTransform: dialogPushTransform
        });
        setDialogVisible(false);
    };

    return (
        <aside className="workbench-aside">
            <Button
                full
                onClick={_ => {
                    setDialogVisible(true);
                    setDialogPushTransform(true);
                }}
                style={{ marginBottom: 12 }}
            >
                add rule
            </Button>
            <TransitionGroup component={null}>
                {
                    state.v.map((v, index) => (
                        <CSSTransition
                            key={v.key}
                            timeout={300}
                            classNames="transform-formular-item"
                        >
                            <TransformFormularCard
                                v={v}

                                onInput={(inputs, rematch = false, matchIndex) => dispatch({
                                    type: 'INPUT',
                                    index,
                                    inputs,
                                    rematch,
                                    matchIndex
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

                                onOpenDialog={_ => {
                                    dispatch({
                                        type: 'SET_CURRENT_INDEX',
                                        index
                                    })
                                    setDialogVisible(true);
                                    setDialogPushTransform(false);
                                }}

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

                                onMatchChange={
                                    value => dispatch({
                                        type: 'SET_CURRENT_MATCH',
                                        value
                                    })
                                }
                            />
                        </CSSTransition>
                    )).reverse()
                }
            </TransitionGroup>
            <DialogMatchPicker visible={dialogVisible} setVisible={setDialogVisible} onApply={handleMatchSelected} />
        </aside >
    )
}

const TransformFormularCard = ({ v, color, onClose, onActive, onInput, onMatch, onOpenDialog, onApply, onMatchChange }) => {
    let className = `transform-formular-card${' ' + color}`;

    return (
        <div className={className}>
            <div className="title">
                <Button onClick={onClose}><CloseOutlined /></Button>
            </div>
            <div className="active-info" onMouseDown={onActive}></div>
            <TransitionGroup className="content-matches">
                {
                    v.matches.map((v, i) => {
                        let V = v.render;
                        return (
                            <CSSTransition
                                key={v.key}
                                timeout={300}
                                classNames="match-item"
                            >
                                <div className="match-item" onClick={_ => onMatchChange(i)}>
                                    <p className="match-item-title">✨{v.title}</p>
                                    <V
                                        color={color}
                                        inputs={v.inputs}
                                        onInput={(inputs, rematch) => onInput(inputs, rematch, i)}
                                        onMatch={onMatch}
                                        onApply={onApply}
                                    />
                                </div>
                            </CSSTransition>

                        );
                    })
                }
            </TransitionGroup>
            <Button onClick={onOpenDialog} full>add new match</Button>
            {
                v.matches.length ?
                    (
                        <div className="content-result" >
                            <div style={{ display: 'grid', gridTemplateColumns: 'auto auto' }}>
                                <span>结果文本:</span>
                                <Input value={v.result} onChange={result => onInput(result, false, -1)} />
                            </div>
                        </div>
                    )
                    : null
            }
            <Button onClick={onApply}>APPLY</Button>
        </div>
    )
}

export default Aside;