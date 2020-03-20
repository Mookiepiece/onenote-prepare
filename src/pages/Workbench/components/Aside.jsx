import React, { useState, useReducer, useCallback, useMemo, useEffect } from 'react';
import Button from "@/components/MkButton";
import Dialog from "@/components/Dialog";
import { Transforms, Editor, Text, Range, Node, Path } from 'slate';

import './style.scss';
import Input from '@/components/Input';
import { useSlate, useEditor } from 'slate-react';

import {
    CloseOutlined
} from '@ant-design/icons';

import { deepCopy } from '../utils'

const applyMatch = (editor, ranges) => {
    ranges.forEach((at, i) => {
        Transforms.setNodes(editor, {
            bling: i + 1,
        }, {
            at,
            match: Text.isText,
            split: true
        });
    });
}
const clearUp = (editor) => {
    Transforms.setNodes(editor, {
        bling: false,
    }, {
        at: Editor.range(editor, Editor.edges(editor)[0], Editor.edges(editor)[1]),
        match: Text.isText,
        split: true
    });
};

const M = [
    {
        title: "match first ### ### in every line",
        desc: 'a match to any first ### ### in every line',

        get() {
            return ({
                match: (editor, { value, result }) => {
                    if (!value) return;
                    const children = editor.children;
                    let childrenAlt = [...children];

                    const ranges = [];

                    //递归遍历树
                    const v = (el, path, children, childrenAlt) => {
                        if (!el.text) {
                            if (!el.type || el.type === 'paragraph') {
                                //pre里面只能有一层span了，故遍历一层拿出text
                                //因为span里面不能继续嵌套p不会改变其它地方的path，所以不用担心因为高亮而split会在嵌套情况下出错，
                                const innerText = el.children.reduce((result, leaf) => result + leaf.text, '');

                                let reIndex = innerText.indexOf(value);

                                let len = value.length;

                                let count = 0;

                                let anchor, focus;

                                //样式不一致的情况
                                //遍历叶子算匹配到的最叶位置
                                el.children.every((leaf, index) => {
                                    let length = Editor.end(editor, [...path, index]).offset;

                                    if (!anchor) {
                                        //anchor 必须在下一个node的开头而非本node的结尾 否则会把这个node搭上 不加等号
                                        if (count + length > reIndex) {
                                            anchor = {
                                                path: [...path, index],
                                                offset: reIndex - count
                                            };

                                        }
                                    }
                                    if (anchor) {
                                        //focus 最好能在node的末尾而非开头 加等号
                                        if (count + length >= reIndex + len) {
                                            focus = {
                                                path: [...path, index],
                                                offset: reIndex - count + len
                                            };
                                            return false;
                                        }
                                    }
                                    count += length;
                                    return true;
                                });

                                if (reIndex > -1) {
                                    ranges.push({
                                        anchor,
                                        focus
                                    });
                                }
                            } else {
                                el.children && el.children.forEach((el, index) => v(el, [...path, index], children, childrenAlt));
                            }
                        }
                    };
                    children.forEach((el, index) => v(el, [index], children, childrenAlt));

                    applyMatch(editor, ranges);//ranges没有必要存，因为applyMatch后数据结构发生变化了，以后可能会考虑decorate
                },
                apply: (editor, { value, result }) => { //TODO support node result and optional keep style
                    const children = editor.children;
                    const v = (el, path, children) => {
                        if (!el.text) {
                            if (!el.type || el.type === 'paragraph') {
                                let lastLeafActive = -1;
                                el.children.forEach((leaf, index) => {
                                    console.log("each")
                                    let thisLeafActive = leaf.bling;

                                    if (thisLeafActive) {
                                        if (!lastLeafActive || lastLeafActive !== thisLeafActive) {
                                            //get leaf range
                                            const at = Editor.edges(editor, [...path, index]).reduce((anchor, focus) => ({ anchor, focus }));

                                            //keep node style and swap text
                                            const [[{ bling, text, ...prevLeaf }]] = Editor.nodes(editor, { at, match: Text.isText });

                                            Transforms.insertNodes(editor, {
                                                ...prevLeaf,
                                                text: result
                                            }, { at });

                                        } else {
                                            //mark to delete
                                            Transforms.setNodes(editor, { '🖤': true, }, { at: [...path, index] });
                                        }
                                    }

                                    lastLeafActive = thisLeafActive;
                                });

                            } else {
                                el.children && el.children.forEach((el, index) => v(el, [...path, index], children));
                            }
                        }
                    }
                    children.forEach((el, index) => v(el, [index], children));

                    Transforms.removeNodes(editor, {
                        at: Editor.edges(editor, []).reduce((anchor, focus) => ({ anchor, focus })),
                        match: n => n['🖤']
                    });
                },

                inputs: { value: '', result: '' },

                render({ color, inputs: { value, result }, onInput, onApply }) {

                    const editor = useSlate();

                    const handleChange = value => {
                        onInput({ value });

                        clearUp(editor);
                        this.match(editor, { value });
                    };

                    return (
                        <>
                            {
                                <>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'auto auto' }}>
                                        <span>匹配文本:</span>
                                        <Input value={value} onChange={handleChange} />
                                        <span>结果文本:</span>
                                        <Input value={result} onChange={result => onInput({ result })} />
                                    </div>
                                    <Button onClick={onApply}>APPLY</Button>
                                </>

                            }
                        </>
                    )
                }
            })
        },

    },
]

const setArrayItem = (array, index, item) => {
    return [
        ...array.slice(0, index),
        item,
        ...array.slice(index + 1, array.length)
    ]
}

const altArrayItem = (array, index, item) => {
    return [
        ...array.slice(0, index),
        { ...array[index], ...item },
        ...array.slice(index + 1, array.length)
    ]
}

const removeArrayItem = (array, index) => {
    return [
        ...array.slice(0, index),
        ...array.slice(index + 1, array.length)
    ]
}

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
                console.log(state.currentIndex, currentState(state))

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
    console.log(state);

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