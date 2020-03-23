import React, { useState, useReducer, useCallback, useMemo, useEffect } from 'react';

import { useSlate, useEditor } from 'slate-react';
import { Transforms, Editor, Text, Range, Node, Path } from 'slate';

import Input from '@/components/Input';
import Button from "@/components/MkButton";
import Switch from '@/components/Switch';

import { applyMatch, clearUp } from './sideEffects';
import {interator } from './utils';


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