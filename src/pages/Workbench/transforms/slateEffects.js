
import { Transforms, Editor, Text, Range, Node, Path } from 'slate';
import { alt, deepCopy } from '@/utils';
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
        [...ranges].reverse().forEach(([path, bling], index) => {
            Transforms.setNodes(editor, {
                bling,
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
        resultInput.options.clear && (resultInput = alt.set(resultInput, 'nodes', [{ type: 'paragraph', children: [{ text: '' }] }]));

        const swapArray = getBlingArray(editor);
        const complieResultFunc = preprocessResultPlaceholders(resultInput);

        [...swapArray].reverse().forEach(([style, at, origin, elPath]) => {

            let el = Children.getEl(newChildren, elPath);
            const result = complieResultFunc([style, at, origin, elPath], el);

            newChildren = swapNode(newChildren, elPath, result);
        });
    } else if (outType === 'node') {
        resultInput.options.clear && (resultInput = alt.set(resultInput, 'nodes', []));

        const swapArray = getBlingArrayOfNodes(editor);
        const complieResultFunc = preprocessResultPlaceholdersOfNodes(resultInput);

        for (let i = swapArray.length - 1; i >= 0; i--) {
            const [els, elPathes, inList] = swapArray[i];

            let ListInList = inList && resultInput.nodes.some(matchType('numbered-list', 'bulleted-list'));

            if (ListInList) {
                // if inList, combine all transforms in this temp variable li first, finally move then to replace the entire list
                // this way we can merge muti matched paragraph in one li
                // beacuse we will merge the slibing paragraph nodes to new result, which is changed once omplieResultFunc calls
                let li = Children.getEl(newChildren, elPathes[0].slice(0, -1));

                let result = complieResultFunc([els, elPathes], li);
                li = { children: result };

                for (i--; i >= 0; i--) {
                    const [els2, elPathes2, inList2] = swapArray[i];

                    if (!inList2) {
                        break;
                    }

                    let eq = pathEqual(elPathes2[0].slice(0, -1), elPathes[0].slice(0, -1));
                    if (!eq) {
                        break;
                    }

                    result = complieResultFunc([els2, elPathes2], li);
                    li = { children: result };
                }
                i++;

                newChildren = swapNode(newChildren, elPathes[0].slice(0, -2), result); //replace ul/ol

            } else {
                let result = complieResultFunc([els, elPathes]);

                newChildren = swapNode(newChildren, elPathes, result);
            }
        }
    }

    setSlateValue(deepCopy(newChildren));
};

/**
 * swap origin placeholder to result nodes
 * leaf and nodes are same, they both have an container with children:[] property
 * @param {Array} root 
 * @param {Array} elPath 
 * @param {Array} result 
 */
const swapNode = (root, elPath, result) => {

    let elCount = 1;
    if (Array.isArray(elPath[0])) {
        elCount = elPath.length;
        elPath = elPath[0];
    }

    const [prevSlibings, nextSlibings] = Children.slibings(root, elPath, elCount);
    const containerPath = elPath.slice(0, -1);

    result = [
        ...prevSlibings,
        ...result,
        ...nextSlibings
    ];

    // if result.options.clear is activated in node match, we'll get result:[], crashes if no any nodes in td/li 
    if (!result.length) result = [{ type: 'paragraph', children: [{ text: '' }] }];

    return alt.set(
        root,
        Children.str(containerPath),
        result
    );
}

const getBlingArray = ({ children }) => {
    let swapArray = []; // [0:original style, 1:at, 2:original-nodes, 3: paragraph container path]
    Children.iterateArray(children, (el, path, children) => {
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
    });
    return swapArray;
}

/**
 * in this high-ordered function, we cache the place of bling-placeholders
 * returns an function that:allow origin nodes as param, then generate result nodes with placeholder replaced by original nodes
 */
const preprocessResultPlaceholders = (result) => {
    let { overrideStyle } = result.options;

    let placeholders = [];

    Children.iterateArray(result.nodes, (el, path, children) => {
        if (el.type === "transform-placeholder") {
            placeholders.unshift([el, path]);
        }
        return true;
    });

    let resultNodes = result.nodes;

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

    return ([style, at, origin, elPath], el) => {
        // replace entire pre element which contains bling leaves to (muti) pre element
        let newNodes = [...resultNodes];

        // swap placeholders by origin leafs
        placeholders.forEach(([placeholder, path]) => {
            // even if this is leaf transform, user could also input muti line result
            // pay caution on mutiline user input result case:
            // origin p:      [p > [      prevLeaf,               matched-leaf,        nextLeaf        ]
            // user-result         [ p > [leaf3],            p > [placeholder],   p > [leaf4]          ]
            // return :            [ p > [prevLeaf,leaf3],   p > [matched-leaf],  p > [leaf4,nextLeaf] ]
            // we need to combine leaf1 and leaf2 into user input result

            const replaced = origin.map(originLeaf => {
                let v = overrideStyle ? { text: v.text } : originLeaf;
                return { ...v, ...placeholder.meta.style, bling: false }
            });

            newNodes = swapNode(newNodes, path, replaced);

        });

        inject_original_leaf_style_to_results_frist_line: {
            overrideStyle && (newNodes = alt.set(newNodes, `0.children`, newNodes[0].children.map(n => ({ ...n, ...style }))));
        }

        inject_original_paragraphs_prevLeaf_and_nextLeaf_slibing_of_matched_bling: {
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

const getBlingArrayOfNodes = ({ children }) => {
    let swapArray = []; // [0:original style, 1:at, 2:original-nodes, 3: paragraph container, 4: paragraph container path]

    function push([el, path, inList, bling]) {
        if (swapArray.length) {
            const [els0, pathes0, inList0, bling0] = swapArray[swapArray.length - 1];
            if (bling0 === bling) { // continus bling, muti nodes
                swapArray[swapArray.length - 1] = [
                    [...els0, el],
                    [...pathes0, path],
                    inList0,
                    bling0
                ];
                return;
            }
        }
        swapArray.push([
            [el],
            [path],
            inList,
            bling
        ]);
    }
    Children.iterateArray(children, (el, path, children) => {
        if (matchType('paragraph')(el)) {
            if (el.bling) {
                let inList = false;

                // lists cannot in a list, if we have a list parent node in bling paragraph, 
                // (despe)-should disable all lists in result root, flat them by their direct children, paragraph or table
                // should swap from list which is two nodes before than pre
                let potentialListParentPath = path.slice(0, -2);
                if (potentialListParentPath.length) {
                    let potentialListParent = Children.getEl(children, potentialListParentPath);
                    if (matchType('numbered-list', 'bulleted-list')(potentialListParent)) {
                        inList = true;
                    }
                }
                push([el, path, inList, el.bling]);
            }
            return true;
        }
        return true;
    });
    return swapArray;
}

const preprocessResultPlaceholdersOfNodes = (result) => {
    let { overrideStyle } = result.options; // TODO

    let placeholders0 = [], placeholders = [];
    Children.iterateArray(result.nodes, (el, path, children) => {
        if (el.type === "transform-placeholder") {
            placeholders0.unshift([el, path]);
        }
        return true;
    });

    let altedResult = [...result.nodes];

    // split the paragraph where placeholders placed in, into three division: [ p>prevLeaf(optional), placeholder, p>nextLeaf(optional) ]
    // placeholders was inline but, anyway it will be replaced by origin nodes
    placeholders0.forEach(([el, path]) => {
        const [prevLeafSlibings, nextLeafSlibings] = Children.slibings(altedResult, path);

        let prevSlibings = prevLeafSlibings.length === 1 && prevLeafSlibings[0].text === '' ? [] : [{ type: 'paragraph', children: prevLeafSlibings }];
        let nextSlibings = nextLeafSlibings.length === 1 && nextLeafSlibings[0].text === '' ? [] : [{ type: 'paragraph', children: nextLeafSlibings }];

        let newPlaceholderPath = [...path.slice(0, -1)];
        newPlaceholderPath[newPlaceholderPath.length - 1] = newPlaceholderPath[newPlaceholderPath.length - 1] + prevSlibings.length;
        placeholders.unshift([el, newPlaceholderPath]);

        altedResult = swapNode(altedResult, path.slice(0, -1), [
            ...prevSlibings,
            el,
            ...nextSlibings
        ]);
    });

    return ([els, pathes], li) => {
        let newNodes = [...altedResult];
        const index = pathes[0][pathes[0].length - 1];

        // swap placeholders by origin paragraph
        placeholders.forEach(([placeholder, path]) => {
            newNodes = swapNode(newNodes, path, els.map(({ bling, ...origin }) => origin));
        });

        // in future case we'll got ul > li > [pre, pre] when user press shift+enter
        // TODO: through current we do not support shift+enter, still need to be careful, we deliver sliblings
        inject_original_paragraphs_prevElems_and_nextElems_when_in_list: {
            if (li !== undefined) {
                const [prevElems, nextElems] = Children.slibings(li.children, [index], pathes.length);
                newNodes = [...prevElems, ...newNodes, ...nextElems];
            }
        }

        return newNodes;
    }
}

const pathEqual = (p1, p2) => {
    return p1.length === p2.length && p1.every((v, i) => v === p2[i])
}