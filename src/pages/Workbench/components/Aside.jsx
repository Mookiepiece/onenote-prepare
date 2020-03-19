import React, { useState, useReducer, useCallback, useMemo } from 'react';
import Button from "@/components/MkButton";
import Dialog from "@/components/Dialog";
import { Transforms, Editor, Text } from 'slate';

import './style.scss';
import Input from '@/components/Input';
import { useSlate } from 'slate-react';

import {
    CloseOutlined
} from '@ant-design/icons';

// console.log([...Editor.nodes(editor, {
//     at: Editor.range(editor, Editor.edges(editor)[0], Editor.edges(editor)[1])
// })]);


// un: (editor) => {
//     Transforms.setNodes(editor, {
//         bling: false,
//     }, { at: Editor.range(editor, Editor.edges(editor)[0], Editor.edges(editor)[1]) });
// },

const applyMatch = (editor, ranges) => {
    ranges.forEach(at => {
        console.log(at);
        Transforms.setNodes(editor, {
            bling: true,
        }, {
            match: n => Text.isText(n),
            at,
            split: true
        });
    });
}
const clearUp = (editor) => {
    Transforms.setNodes(editor, {
        bling: false,
    }, {
        at: Editor.range(editor, Editor.edges(editor)[0], Editor.edges(editor)[1]),
        match: n => Text.isText(n),
        split: true
    });
};

const M = [
    {
        title: "match first ### ### in every line",
        desc: 'a match to any first ### ### in every line',
        func: (editor, value) => {
            const children = editor.children;
            let childrenAlt = [...children];

            const ranges = [];

            //递归遍历树
            const v = (el, path, children, childrenAlt) => {
                console.log(el);
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

            applyMatch(editor, ranges);
        },
        apply(editor,ranges,result){
            
        },
        render(isActive) {
            const editor = useSlate();
            const [value, setValue] = useState("");

            const handleChange = value => {
                setValue(value);
                clearUp(editor);
                if (value)
                    this.func(editor, value);
            };

            return (
                <>
                    <span>match contents:</span>
                    {
                        isActive ?
                            <Input value={value} onChange={handleChange} /> :
                            <span>{value}</span>
                    }
                </>
            )
        }
    },
]

const Aside = () => {
    const [dialogVisible, setDialogVisible] = useState();
    const [state, dispatch] = useReducer((state, action) => {
        switch (action.type) {
            case 'DELETE':
                return {
                    ...state,
                    v: [
                        ...state.v.slice(0, action.index),
                        ...state.v.slice(action.index + 1, state.v.length)
                    ]
                };
            case 'PUSH':
                return {
                    ...state,
                    v: [...state.v, { ...action.value, key: Date.now() }],
                    activeIndex: state.v.length,
                };
            case 'TOGGLE_ACTIVE':
                return {
                    ...state,
                    activeIndex: action.index === state.activeIndex ? null : action.index
                }
        }
    }, {
        activeIndex: null,
        v: []
    });

    const handleClick = (i) => {
        dispatch({
            type: 'PUSH',
            value: M[i]
        });
        setDialogVisible(false);
    };

    return (
        <aside>
            <Button full onClick={_ => setDialogVisible(true)}>add rule</Button>

            {
                state.v.map((m, i) => (
                    <TransformFormularActivated
                        key={m.key}
                        match={m}
                        onClose={_ => dispatch({
                            type: 'DELETE',
                            index: i
                        })}
                        onActive={
                            _ => dispatch({
                                type: 'TOGGLE_ACTIVE',
                                index: i
                            })
                        }
                        isActive={
                            i === state.activeIndex
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

const TransformFormularActivated = ({ match, onClose, onActive, isActive }) => {
    let className = useMemo(_ => {
        return `transform-formular-activated-card${isActive ? ' active' : ''}`
    }, [isActive]);

    return (
        <div className={className}>
            <div className="title">
                <Button onClick={onClose}><CloseOutlined /></Button>
            </div>
            <div className="active-info" onMouseDown={onActive}></div>
            <div className="content"> {match.render(isActive)}</div>
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

// type styleMatch{
//     qsa:String
// }

// type textMatch{
//     re:RegExp
// }

// type match {
//     type:'string'|'style'
//      
// // }

// type transform{

// }