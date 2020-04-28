
import { Transforms, Editor, Text, Range, Node, Path } from 'slate';
import { setArrayItem } from '@/utils';
import { interator } from './utils';
import { alt } from '@/utils';
import { matchType } from '@/components/Editor/utils';

// useless info:
// 根据slate，如果将inline node插入到第一个，前面会又出现一个text:''并不带任何样式，行尾同理
// 对策:插入placeholder后path发生改变，所有同级range往后 +1，如果是行首则+2
// useless info:
// 如果一行内存在多个bling,那么插入biling后会导致整行的path突变
// 具体来说，anchor如果有offset，那么会割开一个新text节点，path+1
// focus如果有负方向的offset，也会割开一个新text节点， path+1,并且后面如果有path完全的节点，会因为这个割开的节点导致offset减少focus.offset的量
// 根据 pathS < pathE < 后面的节点 ， 可以知道只要拿后面的节点和pathE对比即可

//新对策:直接🌸反向遍历就完事了

/** SideEffect: set nodes in ranges to bling✨ */
export const applyMatch = (editor, ranges) => {
    if (!ranges.length) return;
    if (Range.isRange(ranges[0])) {
        // match leaf
        [...ranges].reverse().forEach((range, index) => {
            if (Range.isCollapsed(range)) {
                Transforms.insertNodes(editor, {
                    children: [{ text: '' }],
                    type: 'bling-placeholder',
                }, { at: range.anchor });
            } else {
                Transforms.setNodes(editor, {
                    bling: index + 1,
                }, {
                    at: range,
                    match: Text.isText,
                    split: true
                });
            }
        })
    } else {
        // match element
        [...ranges].reverse().forEach((path, index) => {
            Transforms.setNodes(editor, {
                bling: index + 1,
            }, {
                at: path,
            });
        });
    }

}

// NOTE:
// Transforms.removeNodes(editor, {
//     at: Editor.edges(editor, []).reduce((anchor, focus) => ({ anchor, focus })),
//     match: n => n.type === "bling-placeholder",
// })
// 对以inline node结尾的元素无效
// 正确的做法是 at:[]

/** SideEffect: clear all bling✨ in editor */
export const clearUp = (editor) => {
    Transforms.setNodes(editor, {
        bling: false,
    }, {
        at: [],
        match: _ => true,
        split: true
    });
    Transforms.removeNodes(editor, {
        at: [],
        match: n => n.type === "bling-placeholder",
    });
};

export const applyRender = (editor, result, setSlateValue) => { // TODO support node result and optional keep style
    const children = editor.children;

    let swapArray = []; // [0:original style, 1:at, 2:original-nodes, 3: paragraph container, 4: paragraph container path]

    children.forEach((el, index) => interator(el, [index], children, (el, path, children) => {
        if (matchType('paragraph')(el)) {
            for (let index = 0; index < el.children.length;) {
                const node = el.children[index];
                const { bling, text } = node;
                if (bling) {
                    let focusOffset = text.length; // make sure bling means it's a leaf and has 'text' attr
                    let start = index;
                    for (index++; index < el.children.length; index++) {
                        const another = el.children[index];
                        if (another.bling === bling) {
                            focusOffset = another.text.length;
                        } else {
                            break;
                        }
                    }
                    _: {
                        const { bling, text, ...style } = node;
                        swapArray.push([
                            style,
                            {
                                anchor: { path: [...path, start], offset: 0 },
                                focus: { path: [...path, index - 1], offset: focusOffset }
                            },
                            el.children.slice(start, index),
                            el,
                            path
                        ]);
                    }
                } else if (node.type === 'bling-placeholder') {
                    let style = {};
                    const prevLeaf = el.children[index - 1]; // must exit even if it's a {text:''}, must not another placeholder

                    // styles will be borrow from slibing nodes
                    if (prevLeaf.text.length > 0) {
                        let { bling, text, ..._style } = prevLeaf;
                        style = _style;
                    } else {
                        const nextLeaf = el.children[index + 1];
                        if (nextLeaf.text.length > 0) {
                            let { bling, text, ..._style } = nextLeaf;
                            style = _style;
                        }
                    }

                    swapArray.push([style, [...path, index], [], el, path]);
                    index++;
                } else index++;
            }
            return true;
        } else {
            return true;
        }
    }));

    const swapResultFunc = getSwapResultCallback(result);

    let nv = editor.children;
    // 反向insert to avoid path changes
    [...swapArray].reverse().forEach(([style, at, origin, el, elPath], index) => {
        const nodes = swapResultFunc([style, at, origin, el, elPath], index);
        const containerPath = elPath.slice(0, elPath.length - 1);
        const elIndex = elPath[elPath.length - 1];

        const containerEl = containerPath.reduce((el, index) => el.children[index], { children: nv });
        const slibings = containerEl.children;

        const _ = containerPath.length ? `${containerPath.join('.children.')}.children` : ''; // root path is []
        nv = alt.set(
            nv,
            _,
            [
                ...slibings.slice(0, elIndex),
                ...nodes,
                ...slibings.slice(elIndex + 1, slibings.length)
            ]);
    });

    setSlateValue(nv);
};

const getSwapResultCallback = (result) => {
    let placeholders = []; // cache

    result.nodes.forEach((el, index) => interator(el, [index], result.nodes, (el, path, children) => {
        if (el.type === "transform-placeholder") {
            placeholders.unshift([el, path]);
        }
        return true;
    }));

    let { overrideStyle } = result.options;

    const resultNodes = result.nodes; // do not mutate
    if (!matchType('paragraph')(resultNodes[0])) {
        resultNodes = [{ type: 'paragraph', children: [{ text: '' }] }, ...resultNodes];
    }
    if (!matchType('paragraph')(resultNodes[resultNodes.length - 1])) {
        resultNodes = [...resultNodes, { type: 'paragraph', children: [{ text: '' }] }];
    }


    return ([style, at, origin, el, elPath], index) => {
        // replace entire pre element to (muti) pre element
        let newNodes = [...resultNodes];

        placeholders.forEach(([placeholder, path]) => {
            const placeholderContainerPath = path.slice(0, path.length - 1);
            const placeholderIndex = path[path.length - 1];

            // pay caution on mutiline user input result case:
            // origin p:      [p > [      prevLeaf,               matched-leaf,        nextLeaf        ]
            // user-result         [ p > [leaf3],            p > [placeholder],   p > [leaf4]          ]
            // return :            [ p > [prevLeaf,leaf3],   p > [matched-leaf],  p > [leaf4,nextLeaf] ]
            // we need to combine leaf1 and leaf2 into user input result

            const preEl = placeholderContainerPath.reduce((el, index) => el.children[index], { children: newNodes });
            const slibings = preEl.children;
            newNodes = alt.set(
                newNodes,
                `${placeholderContainerPath.join('.children.')}.children`,
                [
                    ...slibings.slice(0, placeholderIndex),
                    ...origin.map(originLeaf => {
                        let v = originLeaf;
                        if (overrideStyle) {
                            v = { text: v.text };
                        }
                        return { ...v, ...placeholder.meta.style, bling: false }
                    }),
                    ...slibings.slice(placeholderIndex + 1, slibings.length)
                ]);
        });

        inject_original_style_to_frist_line: {
            newNodes = alt.set(newNodes, `0.children`, newNodes[0].children.map(n => ({ ...n, ...style })));
        }

        inject_prevLeaf_and_nextLeaf_slibing_bling: {
            // at could be path when bling placeholder
            let prevLeaf, nextLeaf;
            if (at.anchor) {
                prevLeaf = el.children.slice(0, at.anchor.path[at.anchor.path.length - 1]);
                nextLeaf = el.children.slice(at.focus.path[at.focus.path.length - 1] + 1, el.children.length);
            } else {
                prevLeaf = el.children.slice(0, at[at.length - 1]);
                nextLeaf = el.children.slice(at[at.length - 1] + 1, el.children.length);
            }
            newNodes = alt.set(newNodes, '0.children', [...prevLeaf, ...newNodes[0].children]);
            newNodes = alt.set(newNodes, `${newNodes.length - 1}.children`, [...newNodes[newNodes.length - 1].children, ...nextLeaf]);

        }

        return newNodes;
    }
}
