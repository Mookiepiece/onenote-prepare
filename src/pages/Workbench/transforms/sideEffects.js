
import { Transforms, Editor, Text, Range, Node, Path } from 'slate';

/** SideEffect: set nodes in ranges to bling✨ */
export const applyMatch = (editor, _ranges) => {
    let ranges = _ranges;
    for (let i = 0; i < ranges.length; i++) {
        if (Range.isCollapsed(ranges[i])) {
            insertBlingPlaceholder(editor, ranges, i);
        } else {
            Transforms.setNodes(editor, {
                bling: i + 1,
            }, {
                at: ranges[i],
                match: Text.isText,
                split: true
            });
        }
    }
}

/**除了最后一个数，其余数都相等 */
const pathParentSame = (p1, p2) => {
    return p1.length === p2.length && p1.every((v, i) => i !== p1.length - 1 || p2[i] === v);
}

const insertBlingPlaceholder = (editor, _ranges, index) => {
    let ranges = [..._ranges];

    const range = ranges[index];
    const path = range.anchor.path;

    Transforms.insertNodes(editor, {
        children: [{ text: '' }],
        type: 'bling-placeholder',
    }, { at: range.anchor });

    //NOTE:如果因为插入到第一个，前面会又出现一个text:''节点并不带任何样式
    let isFirstNode = path[path.length - 1] === 0;

    let i = index;

    //插入placeholder后path发生改变，所有同级range往后推
    //WARNING:目前没有任何变换有用到此功能，未测试
    while (ranges[++i]) {
        if (pathParentSame(ranges[i].anchor.path, path)) {
            let anchor = ranges[i].anchor;
            let focus = ranges[i].focus;

            ranges[i] = {
                anchor: {
                    path: [
                        ...anchor.path.slice(0, anchor.path.length - 1),
                        anchor.path[anchor.path.length] + 1 + isFirstNode
                    ],
                    offset: anchor.offset
                },
                focus
            }
        }
        if (pathParentSame(ranges[i].focus.path, path)) {
            let anchor = ranges[i].anchor;
            let focus = ranges[i].focus;

            ranges[i] = {
                anchor,
                focus: {
                    path: [
                        ...focus.path.slice(0, focus.path.length - 1),
                        focus.path[focus.path.length] + 1 + isFirstNode
                    ],
                    offset: focus.offset
                }
            }
        }
    }

    return ranges;
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
