
import { Transforms, Editor, Text, Range, Node, Path } from 'slate';
import { alt } from '@/utils';
import Children from './utils';
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
        });
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

export const applyRender = (editor, resultInput, setSlateValue, outType) => { // TODO support node result and optional keep style
    let newChildren = editor.children;

    if (outType === 'leaf') {
        const swapArray = getBlingArray(editor);
        const complieResultFunc = preprocessResultPlaceholders(resultInput);

        // 反向insert to avoid path changes
        [...swapArray].reverse().forEach(([style, at, origin, elPath]) => {
            const result = complieResultFunc([style, at, origin, elPath], newChildren);

            const containerPath = elPath.slice(0, elPath.length - 1);
            const elIndex = elPath[elPath.length - 1];
            const containerEl = Children.getEl(newChildren, containerPath);
            const slibings = containerEl.children;

            newChildren = alt.set(
                newChildren,
                Children.str(containerPath),
                [
                    ...slibings.slice(0, elIndex),
                    ...result,
                    ...slibings.slice(elIndex + 1, slibings.length)
                ]);
        });
    } else if (outType === 'node') {
        const swapArray = getBlingArrayOfNodes(editor);
        const complieResultFunc = preprocessResultPlaceholdersOfNodes(resultInput);
        [...swapArray].reverse().forEach(([el, elPath, listEl, prevSlibings, nextSlibings]) => {
            const result = complieResultFunc([el, elPath, listEl, prevSlibings, nextSlibings]);

            const containerPath = elPath.slice(0, elPath.length - 1);
            const elIndex = elPath[elPath.length - 1];
            const containerEl = Children.getEl(newChildren, containerPath);
            const slibings = containerEl.children;

            newChildren = alt.set(
                newChildren,
                Children.str(containerPath),
                [
                    ...slibings.slice(0, elIndex),
                    ...prevSlibings,
                    ...result,
                    ...nextSlibings,
                    ...slibings.slice(elIndex + 1, slibings.length)
                ]);
        });

    }

    setSlateValue(newChildren);
};


const getBlingArray = ({ children }) => {
    let swapArray = []; // [0:original style, 1:at, 2:original-nodes, 3: paragraph container, 4: paragraph container path]

    children.forEach((el, index) => Children.iterate(el, [index], children, (el, path, children) => {
        if (matchType('paragraph')(el)) {
            for (let index = 0; index < el.children.length; index++) {
                const node = el.children[index];
                if (node.bling) {
                    let focusOffset = node.text.length; // make sure bling means it's a leaf and has 'text' attr
                    let start = index;
                    while (index < el.children.length) {
                        const another = el.children[index];
                        if (another.bling === node.bling) {
                            focusOffset = another.text.length;
                        } else {
                            break;
                        }
                        index++;
                    }
                    // push time
                    const { bling, text, ...style } = node;
                    swapArray.push([
                        style,
                        {
                            anchor: { path: [...path, start], offset: 0 },
                            focus: { path: [...path, index - 1], offset: focusOffset }
                        },
                        el.children.slice(start, index),
                        path
                    ]);
                    index--;
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

                    swapArray.push([style, [...path, index], [], path]);
                }
            }
            return true;
        } else {
            return true;
        }
    }));
    return swapArray;
}

/**
 * in this high-ordered function, we cache the place of bling-placeholders
 * returns an function that:allow origin nodes as param, then generate result nodes with placeholder replaced by original nodes
 */
const preprocessResultPlaceholders = (result) => {
    let placeholders = [];

    result.nodes.forEach((el, index) => Children.iterate(el, [index], result.nodes, (el, path, children) => {
        if (el.type === "transform-placeholder") {
            placeholders.unshift([el, path]);
        }
        return true;
    }));

    let { overrideStyle } = result.options;

    let resultNodes = result.nodes; // do not mutate

    // we can transform leafs to muti paragraph with tables/list inside, not begin not end
    // so need avoid tables/lists at results first/last line
    insert_empty_paragraph_if_result_not_begin_or_ends_with_paragraph: {
        if (!matchType('paragraph')(resultNodes[0])) {
            resultNodes = [{ type: 'paragraph', children: [{ text: '' }] }, ...resultNodes];
        }
        if (!matchType('paragraph')(resultNodes[resultNodes.length - 1])) {
            resultNodes = [...resultNodes, { type: 'paragraph', children: [{ text: '' }] }];
        }
    }

    return ([style, at, origin, elPath], newResult) => {
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

            const paragraphEl = Children.getEl(newNodes, placeholderContainerPath);
            const placeholderSlibings = paragraphEl.children;
            newNodes = alt.set(
                newNodes,
                Children.str(placeholderContainerPath),
                [
                    ...placeholderSlibings.slice(0, placeholderIndex),
                    ...origin.map(originLeaf => {
                        let v = originLeaf;
                        if (overrideStyle) {
                            v = { text: v.text };
                        }
                        return { ...v, ...placeholder.meta.style, bling: false }
                    }),
                    ...placeholderSlibings.slice(placeholderIndex + 1, placeholderSlibings.length)
                ]
            );
        });

        inject_original_leaf_style_to_results_frist_line: {
            newNodes = alt.set(newNodes, `0.children`, newNodes[0].children.map(n => ({ ...n, ...style })));
        }

        inject_original_paragraphs_prevLeaf_and_nextLeaf_slibing_of_matched_bling: {
            let el = Children.getEl(newResult, elPath);
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


const resultPreprocessor = ([el, path]) => {



}

const getBlingArrayOfNodes = ({ children }) => {
    let swapArray = []; // [0:original style, 1:at, 2:original-nodes, 3: paragraph container, 4: paragraph container path]

    children.forEach((el, index) => Children.iterate(el, [index], children, (el, path, children) => {
        if (matchType('paragraph')(el)) {
            if (el.bling) {

                // lists cannot in a list, if we have a list parent node in bling paragraph, 
                // (despe)-should disable all lists in result root, flat them by their direct children, paragraph or table
                // should swap from list which is two nodes before than pre
                let potentialListParentPath = path.slice(0, -2);
                if (potentialListParentPath.length) {
                    let potentialListParent = Children.getEl(children, potentialListParentPath);
                    if (matchType('numbered-list', 'bulleted-list')(potentialListParent)) {
                        // yep, it's an list

                        // TODO: through current we do not support shift+enter, still need to be careful, so we deliver sliblings
                        const lastPath = path[path.length - 1];
                        const li = Children.getEl(children, path.slice(0, -1));
                        swapArray.push([
                            el,
                            path,
                            potentialListParent,
                            li.children.slice(0, lastPath),
                            li.children.slice(lastPath + 1, li.children.length)]);
                    }
                } else {
                    swapArray.push([el, path, null, [], []]);
                }
            }
            return false;
        }
        return true;
    }));
    return swapArray;
}

const preprocessResultPlaceholdersOfNodes = (result) => {
    let placeholders = [];
    result.nodes.forEach((el, index) => Children.iterate(el, [index], result.nodes, (el, path, children) => {
        if (el.type === "transform-placeholder") {
            placeholders.unshift([el, path]);
        }
        return true;
    }));

    let { overrideStyle } = result.options; // TODO

    return ([el, path, listEl, prevSlibings, nextSlibings], children) => {
        let newNodes = [...result.nodes];

        placeholders.forEach(([placeholder, path]) => {
            const placeholderContainerPath = path.slice(0, path.length - 1);
            const placeholderIndex = path[path.length - 1];
            const paragraphEl = Children.getEl(newNodes, placeholderContainerPath);
            const placeholderSlibings = paragraphEl.children;

            newNodes = alt.set(
                newNodes,
                Children.str(placeholderContainerPath),
                [
                    ...placeholderSlibings.slice(0, placeholderIndex),
                    ...el.children,
                    ...placeholderSlibings.slice(placeholderIndex + 1, placeholderSlibings.length)
                ]
            );
        });

        return newNodes;
    }
}