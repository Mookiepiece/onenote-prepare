
import { Transforms, Editor, Text, Range, Node, Path } from 'slate';
import { setArrayItem } from '@/utils';
import { interator } from './utils';
import { alt } from '@/utils';

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
}

/**除了最后一个数，其余数都相等 */
const pathParentSame = (p1, p2) => {
    return p1.length === p2.length && p1.every((v, i) => i === p1.length - 1 || p2[i] === v);
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
        match: Text.isText,
        split: true
    });
    Transforms.removeNodes(editor, {
        at: [],
        match: n => n.type === "bling-placeholder",
    });
};

export const applyRender = (editor, result) => { //TODO support node result and optional keep style
    const children = editor.children;

    let swapArray = []; //[0:style, 1:at, 2:original-nodes]

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
                        const [[node]] = Editor.nodes(editor, { at, match: Text.isText });
                        const { bling, text, ...style } = node;
                        swapArray.push([style, at, [node]]);

                    } else {
                        const at = Editor.edges(editor, [...path, index]).reduce((anchor, focus) => ({ anchor, focus }));
                        const [[node]] = Editor.nodes(editor, { at, match: Text.isText });

                        swapArray = setArrayItem(swapArray, -1, [
                            swapArray[swapArray.length - 1][0],
                            {
                                anchor:swapArray[swapArray.length - 1][1].anchor,
                                focus:at.focus
                            },
                            [...swapArray[swapArray.length - 1][2], node],
                        ]);
                    }
                }

                lastLeafActive = thisLeafActive;
            });
            return true;
        } else if (el.type === 'bling-placeholder') {
            //get placeholder range

            // get style from sibling leaf,既然placeholder被slate认为是inline元素，左右两边必然各有leaf，虽然有可能是text''
            let style = null;
            //试探前面那个leaf，如果没文字说明它被插入在行首，应该继承后面那个leaf的style
            let [[beforeLeaf]] = Editor.nodes(editor, {
                at: [...path.slice(0, path.length - 1), path[path.length - 1] - 1],
                match: Text.isText
            });

            let isFirst = !beforeLeaf.text.length;

            if (!isFirst) {
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
            swapArray.push([style, path, []]);
        } else {
            return true;
        }
    }));

    const swapResultFunc = getSwapResultCallback(result);

    //反向insert to avoid path changes
    [...swapArray].reverse().forEach(([_style, at, origin], index) => {
        // TODO if(result.options.mutiline)
        // TODO if(result.nodes)
        // TODO if (result.type = 'withStyle') {
        let nodes = swapResultFunc(origin, index);

        console.log(at);
        Transforms.insertNodes(editor, nodes, { at });
    });

    // Transforms.splitNodes();

    Transforms.removeNodes(editor, {
        at: [],
        match: n => n['🖤'] || n.type === 'bling-placeholder'
    });

};

const getSwapResultCallback = (result) => {
    let placeholders = []; // cache

    result.nodes.forEach((el, index) => interator(el, [index], result.nodes, (el, path, children) => {
        if (el.type === "transform-placeholder") {
            placeholders.push([el, path]);
        }
        return true;
    }));

    return (origin, index) => {
        let newNodes = [...result.nodes[0].children];
        placeholders.forEach(([phElem, path]) => {

            let objectPath = [];
            path.forEach(v => {
                objectPath.push(v, 'children')
            });
            objectPath.pop();

            // let preElem = alt.nearleaf(newNodes, objectPath);

            let preElemChildren = newNodes;

            const placeholderIndex = path[path.length - 1];

            origin.reduce((a, el) => { return a + el.text }, '');

            const preElemChildrenAfterSwap = [
                ...preElemChildren.slice(0, placeholderIndex),
                ...origin.map(v => { return { ...v, ...phElem.meta.style, bling: false } }),
                ...preElemChildren.slice(placeholderIndex + 1, preElemChildren.length)
            ];
            // const preElemChildrenAfterSwap=origin;

            newNodes = preElemChildrenAfterSwap;
            console.log(phElem, objectPath, newNodes);

            // if (el.meta.mirror === "ORIGIN" || true) { //WARNING: true
            //     newNodes = alt.set(newNodes, objectPath.slice(0, objectPath.length - 1), preElemChildrenAfterSwap);
            // }

        });

        return newNodes;
    }
}