import React, { useState, useReducer, useCallback, useMemo, useEffect } from 'react';
import { Transforms, Editor, Text, Range, Node, Path } from 'slate';

import {
    PlusCircleOutlined
} from '@ant-design/icons';

import Input from '@/components/Input';
import Button from "@/components/MkButton";
import Switch from '@/components/Switch';
import Dialog from "@/components/Dialog";
import AsideDialog from "@/components/Dialog/asideDialog";

import './style.scss';

import { interator } from './utils';
import { setArrayItem } from '@/utils';

export const MGet = (i) => {
    let { inputs, ...staticAttrs } = M[i];
    return { ...staticAttrs, inputs: inputs() }
}

export const M = [
    {
        title: "行内文本匹配",
        desc: '匹配行内文本',
        inType: '',
        outType: 'leaf',

        inputs: _ => ({ value: '', matchAll: true }),

        match: (editor, prevRanges, { value, matchAll }) => {
            if (!value) return [];
            const children = editor.children;

            const ranges = [];

            children.forEach((el, index) => interator(el, [index], children, (el, path, children) => {
                if (el.text === undefined && (!el.type || el.type === 'paragraph')) {
                    //匹配过程中pre里面只能有一层span不会出现placeholder
                    const innerText = el.children.reduce((result, leaf) => result + leaf.text, '');

                    const matchResults = [...innerText.matchAll(new RegExp(value, 'g'))];

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
            return ranges;
        },

        render({ inputs, onInput, onMatch }) {
            const { value, matchAll } = inputs;

            return (
                <>
                    <div className="grid" >
                        <span>匹配文本:</span>
                        <Input
                            value={value}
                            onChange={value => onInput({ value }, true)}
                            onFocus={onMatch}
                        />
                        <span>匹配所有:</span>
                        <Switch
                            value={matchAll}
                            onChange={matchAll => onInput({ matchAll })}
                        />
                    </div>
                </>
            )
        }
    },
    {
        title: "行首匹配",
        desc: '匹配（以某文本串开头的）行首',
        inType: '',
        outType: 'leaf',

        inputs: _ => ({ value: '' }),
        match: (editor, prevRanges, { value }) => {
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
            return ranges;
        },

        render({ inputs, onInput, onMatch }) {
            const { value } = inputs;

            return (
                <>
                    <div className="grid" >
                        <span>开头限制:</span>
                        <Input value={value} onChange={value => onInput({ value }, true)} onFocus={onMatch} />
                    </div>
                </>
            )
        }
    },
    {
        title: "行尾匹配",
        desc: '匹配（以某文本串结尾的）行尾',
        inType: '',
        outType: 'leaf',

        inputs: _ => ({ value: '', }),
        match: (editor, prevRanges, { value }) => {
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
            return ranges;
        },

        render({ inputs, onInput, onMatch }) {
            const { value } = inputs;

            return (
                <>
                    <div className="grid">
                        <span>结尾限制:</span>
                        <Input value={value} onChange={value => onInput({ value }, true)} onFocus={onMatch} />
                    </div>
                </>
            )
        }
    },
    {
        title: "文字样式匹配",
        desc: '筛选具有文字颜色，加粗，斜体等样式的文字',
        inType: '',
        outType: 'leaf',

        inputs: _ => ({ bold: [false, true], }),
        match: (editor, prevRanges, { bold }) => {
            const children = editor.children;

            console.log(bold);
            const ranges = [];

            children.forEach((el, index) => interator(el, [index], children, (el, path, children) => {
                if (el.text !== undefined) {
                    if (bold[0]) {
                        if (!(el.bold === bold[1] || el.bold === undefined && !bold[1]))  //NOTE: undefined !== false and undefined !== true
                            return false; //NOTE:return 仅仅是表示能不能继续向下循环 //不过这里防止push了
                    } else {
                        return false;
                    }

                    ranges.push({
                        anchor: { path, offset: 0 },
                        focus: Editor.end(editor, path)
                    });
                }
                return true;
            }));

            return ranges;
        },

        render({ inputs, onInput, onMatch }) {
            const { bold } = inputs;

            const [visible, setVisible] = useState();

            return (
                <>
                    <div className="grid">
                        <span>选项:</span>
                        <Button onClick={_ => setVisible(true)}><PlusCircleOutlined /></Button>
                    </div>
                    <AsideDialog visible={visible} setVisible={setVisible}>
                        <div className="match-rule-style-match">
                            <span>粗体:</span>
                            <Switch
                                value={bold[0]}
                                onChange={v => onInput({ bold: setArrayItem(bold, 0, v) }, true)}
                            />
                            {
                                bold[0] ? (
                                    <>
                                        <span>有无</span>
                                        <Switch
                                            value={bold[1]}
                                            onChange={v => onInput({ bold: setArrayItem(bold, 1, v) }, true)}
                                        />
                                    </>
                                ) : null
                            }
                        </div>
                    </AsideDialog>
                </>
            )
        }
    }
]
