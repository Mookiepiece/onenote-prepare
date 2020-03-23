import React, { useState, useReducer, useCallback, useMemo, useEffect } from 'react';

import { useSlate, useEditor } from 'slate-react';
import { Transforms, Editor, Text, Range, Node, Path } from 'slate';

import Input from '@/components/Input';
import Button from "@/components/MkButton";
import Switch from '@/components/Switch';

import { applyMatch, clearUp } from './sideEffects';

/**
 * interate the slate vdom tree
 * @param {Node} el 
 * @param {Array} path 
 * @param {Array} children 
 * @param {Function} callback 
 */
const interator = (el, path, children, callback) => {
    if (callback(el, path, children)) {  //TODO many 'return true;' in callback
        el.children && el.children.forEach((el, index) => interator(el, [...path, index], children, callback));
    }
}

const applyOfAll = (editor, { value, result }) => { //TODO support node result and optional keep style
    const children = editor.children;

    children.forEach((el, index) => interator(el, [index], children, (el, path, children) => {
        if (el.text === undefined && (!el.type || el.type === 'paragraph')) { //NOTE:强制undefined是因为加入inline Node在行首尾时，会因为normalize而会出现text''的Leaf强制在首尾
            let lastLeafActive = -1;
            el.children.forEach((leafOrPlaceholder, index) => {
                let thisLeafActive = leafOrPlaceholder.bling;

                if (thisLeafActive) {
                    if (!lastLeafActive || lastLeafActive !== thisLeafActive) {//防止两个range粘在一起而误判
                        //get leaf range
                        const at = Editor.edges(editor, [...path, index]).reduce((anchor, focus) => ({ anchor, focus }));

                        //keep node style and swap text
                        const [[{ bling, text, ...style }]] = Editor.nodes(editor, { at, match: Text.isText });

                        Transforms.insertNodes(editor, {
                            ...style,
                            text: result
                        }, { at });

                    } else {
                        //mark to delete
                        Transforms.setNodes(editor, { '🖤': true, }, { at: [...path, index] });
                    }
                }

                lastLeafActive = thisLeafActive;
            });
            return true;
        } else if (el.type === 'bling-placeholder') {
            //get placeholder range

            //既然placeholder被slate认为是inline元素，左右两边必然各有leaf，虽然有可能是text''
            let style = null;
            //试探前面那个leaf，如果没文字说明它被插入在行首，应该继承后面那个leaf的style
            let [[beforeLeaf]] = Editor.nodes(editor, {
                at: [...path.slice(0, path.length - 1), path[path.length - 1] - 1],
                match: Text.isText
            });

            let isFirst = !beforeLeaf.text.length;

            if (isFirst) {
                let { bling, text, ..._style } = beforeLeaf;
                style = _style;
            } else {
                let [[afterLeaf]] = Editor.nodes(editor, {
                    at: [...path.slice(0, path.length - 1), path[path.length - 1] + 1],
                    match: Text.isText
                });
                let { bling, text, ..._style } = afterLeaf;
                style = _style;
            }

            //keep node style and swap text
            //因为开头是一个text:''，所以把这个应用了会替代开头的text''不会造成path变化
            Transforms.insertNodes(editor, {
                // ...style,
                '🤍': true,
                text: result
            }, {
                at: path,
            });
            if (!isFirst) {
                Transforms.removeNodes(editor, {
                    at: [...path.slice(0, path.length - 1), path[path.length - 1] + 1]
                });
            }
        } else {
            return true;
        }
    }));

    Transforms.removeNodes(editor, {
        at: [],
        match: n => n['🖤'] || n.type === 'bling-placeholder'
    });

};

const T = [
    {
        title: "行内文本匹配",
        desc: '匹配行内文本',

        get() {
            return ({
                inputs: { value: '', matchAll: true, result: '' },

                match: (editor, { value, matchAll, result }) => {
                    clearUp(editor);
                    if (!value) return;
                    const children = editor.children;

                    const ranges = [];

                    children.forEach((el, index) => interator(el, [index], children, (el, path, children) => {
                        if (el.text === undefined && (!el.type || el.type === 'paragraph')) {
                            //匹配过程中pre里面只能有一层span不会出现placeholder
                            const innerText = el.children.reduce((result, leaf) => result + leaf.text, '');

                            const matchResults = [...innerText.matchAll(new RegExp(value, 'g'))];
                            console.log(matchResults);

                            if (matchResults.length) {
                                let resultPointer = 0;
                                let resultIndex = matchResults[resultPointer].index;
                                let resultLength = matchResults[resultPointer][0].length;

                                let count = 0;
                                let anchor, focus;
                                let allRangesWasPushedFlag = false;
                                for (let index = 0; index < el.children.length; index++) {
                                    let leafLength = Editor.end(editor, [...path, index]).offset;

                                    while (true) {
                                        if (!anchor) {
                                            //anchor 必须在下一个node的开头而非本node的结尾 否则会把这个node搭上 不加等号
                                            if (count + leafLength > resultIndex) {
                                                anchor = {
                                                    path: [...path, index],
                                                    offset: resultIndex - count
                                                };
                                            } else {
                                                break;
                                            }
                                        }
                                        if (anchor) {
                                            //focus 最好能在node的末尾而非开头 加等号
                                            if (count + leafLength >= resultIndex + resultLength) {
                                                focus = {
                                                    path: [...path, index],
                                                    offset: resultIndex - count + resultLength
                                                };
                                                ranges.push({ anchor, focus });
                                                anchor = focus = null;
                                                if (++resultPointer < matchResults.length) {
                                                    resultIndex = matchResults[resultPointer].index;
                                                    resultLength = matchResults[resultPointer][0].length;
                                                } else {
                                                    allRangesWasPushedFlag = true;
                                                    break;
                                                }
                                            } else {
                                                break;
                                            }
                                        }
                                    }
                                    count += leafLength;
                                    if (allRangesWasPushedFlag)
                                        break;
                                }
                            }
                            return false;
                        } else {
                            return true; //text或非paragraph继续循环，p停止？
                        }
                    }));
                    console.log('ranges', ranges)
                    applyMatch(editor, ranges);//ranges没有必要存，因为applyMatch后数据结构发生变化了，以后可能会考虑decorate
                },

                apply: applyOfAll,
                render({ color, inputs, onInput, onApply }) {
                    const { value, matchAll, result } = inputs;
                    const editor = useSlate();

                    const handleChange = value => {
                        onInput({ value });
                        this.match(editor, { value });
                    };

                    return (
                        <>
                            {
                                <>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'auto auto' }}>
                                        <span>匹配文本:</span>
                                        <Input value={value} onChange={handleChange} onFocus={_ => this.match(editor, inputs)} />
                                        <span>结果文本:</span>
                                        <Input value={result} onChange={result => onInput({ result })} />
                                        <span>匹配所有:</span>
                                        <Switch value={matchAll} onChange={matchAll => onInput({ matchAll })} />
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
    {
        title: "行首匹配",
        desc: '匹配（以某文本串开头的）行首',
        get() {
            return {
                inputs: { value: '', result: '' },
                match: (editor, { value, result }) => {
                    clearUp(editor);
                    // if (!value) return; 0字符仍然匹配开头
                    const children = editor.children;

                    const ranges = [];

                    if (value === '') {
                        children.forEach((el, index) => interator(el, [index], children, (el, path, children) => {
                            if (el.text === undefined && (!el.type || el.type === 'paragraph')) {
                                let anchor, focus;
                                anchor = focus = { path: [...path, 0], offset: 0 }
                                ranges.push({ anchor, focus });
                            }
                            return true;
                        }));
                    } else {
                        children.forEach((el, index) => interator(el, [index], children, (el, path, children) => {
                            if (el.text === undefined && (!el.type || el.type === 'paragraph')) {
                                const innerText = el.children.reduce((result, leaf) => result + leaf.text, '');
                                if (innerText.startsWith(value)) {
                                    let anchor = { path: [...path, 0], offset: 0 }, focus;
                                    let len = value.length;
                                    let count = 0;

                                    for (let index = 0; index < el.children.length; index--) {
                                        let leafLength = Editor.end(editor, [...path, index]).offset;
                                        if (count + leafLength >= len) {
                                            focus = {
                                                path: [...path, index],
                                                offset: len - count
                                            };
                                            break;
                                        }
                                        count += leafLength;
                                    }

                                    ranges.push({ anchor, focus });
                                }
                            }
                            return true;
                        }));
                    }

                    applyMatch(editor, ranges);
                },

                apply: applyOfAll,
                render({ color, inputs, onInput, onApply }) {
                    const { value, result } = inputs;
                    const editor = useSlate();

                    const handleChange = value => {
                        onInput({ value });
                        this.match(editor, { ...inputs, value });
                    };

                    return (
                        <>
                            {
                                <>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'auto auto' }}>
                                        <span>开头限制:</span>
                                        <Input value={value} onChange={handleChange} onFocus={_ => this.match(editor, inputs)} />
                                        <span>结果文本:</span>
                                        <Input value={result} onChange={result => onInput({ result })} />
                                    </div>
                                    <Button onClick={onApply}>APPLY</Button>
                                </>
                            }
                        </>
                    )
                }
            }

        },
    },
    {
        title: "行尾匹配",
        desc: '匹配（以某文本串结尾的）行尾',
        get() {
            return {
                inputs: { value: '', result: '' },
                match: (editor, { value, result }) => {
                    clearUp(editor);
                    const children = editor.children;

                    const ranges = [];

                    if (value === '') {
                        children.forEach((el, index) => interator(el, [index], children, (el, path, children) => {
                            if (el.text === undefined && (!el.type || el.type === 'paragraph')) {
                                let anchor, focus;
                                anchor = focus = Editor.end(editor, path);
                                ranges.push({ anchor, focus });
                            }
                            return true;
                        }));
                    } else {
                        children.forEach((el, index) => interator(el, [index], children, (el, path, children) => {
                            if (el.text === undefined && (!el.type || el.type === 'paragraph')) {
                                const innerText = el.children.reduce((result, leaf) => result + leaf.text, '');
                                if (innerText.endsWith(value)) {
                                    let anchor, focus = Editor.end(editor, path);
                                    let len = value.length;
                                    let count = 0;

                                    for (let index = el.children.length - 1; index >= 0; index--) {
                                        let leafLength = Editor.end(editor, [...path, index]).offset;
                                        if (count + leafLength >= len) { //反的所以是正的
                                            anchor = {
                                                path: [...path, index],
                                                offset: count - len //反的
                                            };
                                            break;
                                        }
                                        count += leafLength;
                                    }

                                    ranges.push({ anchor, focus });
                                }
                            }
                            return true;
                        }));
                    }

                    applyMatch(editor, ranges);
                },

                apply: applyOfAll,
                render({ color, inputs, onInput, onApply }) {
                    const { value, result } = inputs;
                    const editor = useSlate();

                    const handleChange = value => {
                        onInput({ value });
                        this.match(editor, { ...inputs, value });
                    };

                    return (
                        <>
                            {
                                <>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'auto auto' }}>
                                        <span>结尾限制:</span>
                                        <Input value={value} onChange={handleChange} onFocus={_ => this.match(editor, inputs)} />
                                        <span>结果文本:</span>
                                        <Input value={result} onChange={result => onInput({ result })} />
                                    </div>
                                    <Button onClick={onApply}>APPLY</Button>
                                </>
                            }
                        </>
                    )
                }
            }

        },
    },
    {
        title: "字符样式匹配",
        desc: '匹配特定的样式',
        get() {
            return {
                inputs: { styles: {} },
                match: (editor, { }) => {
                    clearUp(editor);
                    const children = editor.children;

                    const ranges = [];

                    children.forEach((el, index) => interator(el, [index], children, (el, path, children) => {

                        return true;
                    }));

                    applyMatch(editor, ranges);
                },

                apply: applyOfAll,
                render({ color, inputs, onInput, onApply }) {
                    const { styles, targetStyles } = inputs;
                    const editor = useSlate();

                    const handleChange = value => {
                        onInput({ value });
                        this.match(editor, { ...inputs, value });
                    };

                    const handleStyles = _ => {

                    }

                    return (
                        <>
                            {
                                <>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'auto auto auto' }}>
                                        <Switch />
                                        <span>背景色:</span>
                                        <switch></switch>
                                        <span>前景色:</span>
                                    </div>
                                    <Button onClick={onApply}>APPLY</Button>
                                </>
                            }
                        </>
                    )
                }
            }

        },
    },
]

export default T;