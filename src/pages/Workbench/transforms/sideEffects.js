
import { Transforms, Editor, Text, Range, Node, Path } from 'slate';

/** SideEffect: set nodes in ranges to bling✨ */
export const applyMatch = (editor, _ranges) => {
    let ranges = _ranges;
    for (let i = 0; i < ranges.length; i++) {
        if (Range.isCollapsed(ranges[i])) {
            insertBlingPlaceholder(editor, ranges, i, ranges[i].anchor.path);
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

const pathParentSame = (p1, p2) => {
    return p1.length === p2.length && p1.every((v, i) => p2[i] === v);
}

const insertBlingPlaceholder = (editor, _ranges, index, path) => {
    Transforms.insertNodes(editor, {
        children: [{ text: '' }],
        type: 'bling-placeholder',
    }, { at: path });

    //NOTE:如果因为插入到第一个，前面会又出现一个text:''节点并不带任何样式，估计是normalize搞得
    let isFirstNode = path[path.length] === 0;

    let i = index;
    let ranges = [..._ranges];

    //插入placeholder后path发生改变，所有同级range往后推
    while (ranges[++i]) {
        if (pathParentSame(ranges[i].anchor, path)) {
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
        if (pathParentSame(ranges[i].focus, path)) {
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

/** SideEffect: clear all bling✨ in editor */
export const clearUp = (editor) => {
    Transforms.setNodes(editor, {
        bling: false,
    }, {
        at: Editor.edges(editor, []).reduce((anchor, focus) => ({ anchor, focus })),
        match: Text.isText,
        split: true
    });
    Transforms.removeNodes(editor, {
        at: Editor.edges(editor, []).reduce((anchor, focus) => ({ anchor, focus })),
        match: n => n.type === "bling-placeholder",
    })
};
