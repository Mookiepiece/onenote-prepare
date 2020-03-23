
import { Transforms, Editor, Text, Range, Node, Path } from 'slate';
import { setArrayItem } from '@/utils';
/** SideEffect: set nodes in ranges to bling✨ */
export const applyMatch = (editor, _ranges) => {
    let ranges = [..._ranges]; //will replace new elements in array, so dont modify original array

    for (let i = 0; i < ranges.length; i++) {
        if (Range.isCollapsed(ranges[i])) {
            insertBlingPlaceholder(editor, ranges, i);
        } else {
            setLeafBling(editor, ranges, i);
        }
    }
}

/**除了最后一个数，其余数都相等 */
const pathParentSame = (p1, p2) => {
    return p1.length === p2.length && p1.every((v, i) => i === p1.length - 1 || p2[i] === v);
}

const insertBlingPlaceholder = (editor, ranges, index) => {
    const range = ranges[index];

    //NOTE:
    //根据slate，如果将inline node插入到第一个，前面会又出现一个text:''并不带任何样式，行尾同理
    //对策:插入placeholder后path发生改变，所有同级range往后 +1，如果是行首则+2

    Transforms.insertNodes(editor, {
        children: [{ text: '' }],
        type: 'bling-placeholder',
    }, { at: range.anchor });

    const path = range.anchor.path;

    let isFirstNode = path[path.length - 1] === 0;
    const pathPlus = 1 + isFirstNode;

    //WARNING:目前没有任何变换有用到此功能，未测试
    while (ranges[++index]) {
        let { anchor, focus } = ranges[index];

        if (pathParentSame(anchor.path, path)) {

            ranges[index] = {
                anchor: {
                    path: setArrayItem(anchor.path, - 1, i => i + pathPlus),
                    offset: anchor.offset
                },
                focus: {
                    path: setArrayItem(focus.path, - 1, i => i + pathPlus),
                    offset: focus.offset
                }
            }
        } else break;
    }

    return ranges;
}

const setLeafBling = (editor, ranges, index) => {
    const range = ranges[index];
    const pathS = range.anchor.path;
    const offsetS = range.anchor.offset;
    const pathE = range.focus.path;
    const offsetE = range.focus.offset;

    // 如果一行内存在多个bling,那么插入biling后会导致整行的path突变
    // 具体来说，anchor如果有offset，那么会割开一个新text节点，path+1
    // focus如果有负方向的offset，也会割开一个新text节点， path+1,并且后面如果有path完全的节点，会因为这个割开的节点导致offset减少focus.offset的量
    // 根据 pathS < pathE < 后面的节点 ， 可以知道只要拿后面的节点和pathE对比即可

    const pathPlus = (offsetS !== 0) + (offsetE !== Editor.end(editor, range.focus.path).offset);
    const offsetReduce = offsetE;

    Transforms.setNodes(editor, {
        bling: index + 1,
    }, {
        at: range,
        match: Text.isText,
        split: true
    });

    //NOTE:两个path最多是处在p节点的不同位置，也就是说要么parentSame,要么就是下一行了不再受path突变影响了所以直接break;
    while (ranges[++index]) {
        let { anchor, focus } = ranges[index];

        if (pathParentSame(anchor.path, pathE)) {
            let shouldAnchorReduceOffset = anchor.path[anchor.path.length - 1] === pathE[pathE.length - 1];
            let shouldFocusReduceOffset = focus.path[focus.path.length - 1] === pathE[pathE.length - 1];

            ranges[index] = {
                anchor: {
                    path: setArrayItem(anchor.path, - 1, i => i + pathPlus),
                    offset: shouldAnchorReduceOffset ? anchor.offset - offsetReduce : anchor.offset
                },
                focus: {
                    path: setArrayItem(focus.path, - 1, i => i + pathPlus),
                    offset: shouldFocusReduceOffset ? focus.offset - offsetReduce : focus.offset
                },
            }
        } else break;
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
        match: Text.isText,
        split: true
    });
    Transforms.removeNodes(editor, {
        at: [],
        match: n => n.type === "bling-placeholder",
    })
};
