
/**
 * wangEditor的实现是强行正则后直接插入，会导致很多不存在的标签如aside、artcle存在
 * 显然slatejs对数据结构是很严格的，而且必须转JSON
 * 这里的函数我是开空标签一个个实验的，单看可能就理解不来
 * 
 * ON某种情况下会复制出ul嵌套ul的列表，解决方法暂时是只看li不看ul（歪打正着？）已计入README
 */


/** https://htmlreference.io/  */

const LF_NORMAL = [
    'A', 'ABBR', 'BDI', 'BDO', 'DATA', 'LEGEND', 'OUTPUT',
    'KBD', 'LABEL', 'RUBY', 'RT', 'RQ', 'RC', 'TIME', 'TRACK', 'WBR',
    'SPAN', 'MARK',
];

const LF_CODE = ['CODE', 'VAR', 'SAMP'];

const LFSM = new Map([
    ...LF_NORMAL.map(v => [v, {}]),
    ...LF_CODE.map(v => [v, {}]),

    ['ADDRESS', { italic: true }],
    ['B', { bold: true }],
    ['EM', { italic: true }],
    ['SITE', { italic: true }],
    ['DEL', { strike: true }],
    ['DFN', { italic: true }],
    ['S', { strike: true }],
    ['STRONG', { bold: true }],
    ['SMALL', {}],
    ['Q', {}],
    ['SUB', {}],
    ['SUP', {}],
    ['U', { underline: true }],
]);

let EL_DIVS = [
    'ARTICLE', 'ASIDE', 'BLOCKQUOTE', 'BODY', 'CAPTION',
    'FOOTER', 'HEADER', 'MAIN', 'NAV', 'SECTION',

    'DETAILS', 'SUMMARY', 'DIALOG', 'DIV', 'FIELDSET', 'FIGURE', 'FIGCAPTION',
    'LEGEND', 'PICTURE',

    'TABLE', 'TBODY', 'THEAD', 'TFOOT', 'TD', 'TR', 'TH', // desp: already handled by deserializeTableX

    'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HGROUP', 'P', 'PRE',
    'DL', 'DT', 'DD', 'UL', 'OL', 'LI'
]

const ELSM = new Map([
    ...EL_DIVS.map(v => [v, { type: 'paragraph' }]),

    ['TABLE', { type: 'table' }],
    ['TR', { type: 'table-row' }],
    ['TH', { type: 'table-row' }],
    ['TD', { type: 'table-cell' }],
]);

const defaulta = _ => ({ type: 'paragraph', children: [{ text: '' }] });

// words
// ---
// el: elements
// node: text、elements、attributes, even comments

// functions
// ---
// deserializeX           -> el.ROOT      -> {type: root    }
// deserializeFragmentX   -> Array<nodes> -> Array<{type}>
// desertializeTableX     -> el.table     -> {type:table }
// deserializeListX       -> el.li        -> {type:list  }
// deserializeLeaves      -> Array<el>    -> Array<{text}>

function deserializeX(el) { // need element, not text
    return {
        type: 'root',
        children: deserializeFragmentX(HTML.childNodes(el), {})
    }
}

function deserializeFragmentX(children) {
    let ans = []

    for (let i = 0; i < children.length; i++) {
        if (judgeInline(children[i]) === 1) { // TEXT_NODEs, inline elements will be binded into a paragraph
            let leaves = [children[i]];

            for (i++; i < children.length; i++) {
                if (!judgeInline(children[i])) {
                    break;
                }
                leaves.push(children[i]);
            }
            i--;

            ans.push({
                type: 'paragraph',
                children: deserializeLeaves(leaves)
            });
        } else if (judgeInline(children[i]) === 2) { // block-level element: table, list, div
            if (children[i].nodeName === 'TABLE') {
                ans.push(deserializeTableX(children[i]));
            } else if (['LI', 'DT'].includes(children[i].nodeName)) {
                ans.push(deserializeListX(children[i]));
            } else {
                ans.push(deserializeFragmentX(HTML.childNodes(children[i]))); // DIV does not matters, we just deep into inline
            }
        } else if (judgeInline(children[i]) === 0) {
            // invalid node, do nothing, please refer to function judgeInline
        }
    }
    // if (!ans.length) ans = [defaulta()] // TODO: no empty
    return ans.flat();
}

function deserializeTableX(el) {
    let tfboys = HTML.childNodes(el);
    if (tfboys.every(n => ['TBODY', 'THEAD', 'TFOOT', 'CAPTION'].includes(n.nodeName))) {

        let trNodes = tfboys.reduce((arr, tbodyNode) => {
            if (tbodyNode.nodeName === 'CAPTION') {
                return [...arr, {
                    nodeType: Node.ELEMENT_NODE,
                    nodeName: 'TBODY',
                    childNodes: [{
                        nodeType: Node.ELEMENT_NODE,
                        nodeName: 'TR',
                        childNodes: [{
                            nodeType: Node.ELEMENT_NODE,
                            nodeName: 'TD',
                            childNodes: [tbodyNode]
                        }]
                    }]
                }];
            }

            return [...arr, ...HTML.childNodes(tbodyNode)];
        }, []);

        let tdValid = true;
        let maxTdsLen = 0;
        let trs = trNodes.map(trNode => { // no matter whether u are really tr, just do it √
            let tdNodes = HTML.childNodes(trNode);

            tdValid = tdValid && tdNodes.every(n => ['TH', 'TD'].includes(n.nodeName));
            maxTdsLen = Math.max(tdNodes.length, maxTdsLen);

            return {
                type: 'table-row',
                children: tdNodes.map(tdNode => ({
                    type: 'table-cell',
                    children: deserializeFragmentX(HTML.childNodes(tdNode))
                }))
            }
        });

        // anti-alias
        trs = trs.map(tr => {
            let tdLeft = Array(maxTdsLen - tr.children.length).fill(0).map(
                _ => ({ type: 'table-cell', children: [{ type: 'paragraph', children: [{ text: '' }] }] })
            );
            return {
                ...tr,
                children: [...tr.children, ...tdLeft]
            }
        })

        if (!tdValid) return defaulta(); // INVALID td / th

        return {
            type: 'table',
            children: trs
        }
    } else {
        return defaulta(); // INVALID tbody
    }
}

function deserializeListX(el) {
    return {
        type: 'bulleted-list',
        children: [
            {
                type: 'list-item',
                children: deserializeFragmentX(HTML.childNodes(el))
            }
        ]
    };
}

/**
 * @example
 * <div> 
 *   'aaa' 
 *   <div>
 *      'bbb'
 *   </div>
 * </div>
 * returns: [{text:'aaa'}, {text:'bbb'}]
 * 
 * @param {NodeList|Array} childNodes 
 */
function deserializeLeaves(childNodes) {
    if (!childNodes.length) return [{ text: '' }];
    return childNodes.map(leaf => { // note that if we pass [] to deserializeLeaves, map function will not excuted and return [] and it works well
        if (leaf.nodeType === Node.TEXT_NODE) {
            return {
                text: leaf.textContent
            }
        } else {
            return deserializeLeaves(HTML.childNodes(leaf)); // not flatted *1, 
        }
    }).flat(); // flat *1
}

function judgeInline(el) {
    if (el.nodeType === Node.TEXT_NODE && HTML.notBlank(el)) {
        return 1;
    } else if (el.nodeType !== Node.ELEMENT_NODE) { //unreconized node type
        return 0;
    }

    const style = el.style;
    if (ELSM.has(el.nodeName)) { // block-level element
        if (['inline'].includes(style.display)) { // inine block also inline
            return 1;
        }
        return 2;
    } else if (LFSM.has(el.nodeName)) { // inline-level tags (UA default), no matter whether it is inline
        // TODO: will getComputedStyle cost CPUs?
        if (['block', 'inline-block', 'inline-flex', 'inline-grid'].includes(style.display)) { // inine block also inline
            return 2;
        }
        return 1;
    }
    return 0; // unreconized node tag
}

const HTML = {
    childNodes(el) {
        return [...el.childNodes].filter(this.notBlank);
    },
    notBlank(n) {
        return !(n.nodeType === Node.TEXT_NODE && n.textContent.trim() === "" && n.textContent[0] === '\n');
    }
}

export default deserializeX;
