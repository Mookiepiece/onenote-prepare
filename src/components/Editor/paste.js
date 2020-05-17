/**
 * wangEditor的实现是强行正则后直接插入，会导致很多不存在的标签如aside、artcle存在
 * 显然slatejs对数据结构是很严格的，而且必须转JSON
 * 
 * ON某种情况下会复制出ul嵌套ul的列表，解决方法暂时是只看li不看ul（歪打正着？）已计入README
 */

import { Text } from "slate";
import { matchType } from "./utils";

// TODO: npm i -S css-color-keywords, rgb? hsl?  
// TODO: not support text node with '\n' in web case, but ON has '\n' for blank node

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

const RegExpOfAllBlank = /^[ \n]*$/;

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
        children: deserializeFragmentX(HTML.childNodes(el, { notBlank: false }), {})
    }
}

function deserializeFragmentX(children, css) {
    let ans = [];
    const { whiteSpace = false } = css;

    for (let i = 0; i < children.length; i++) {
        const judgeResult = judgeInline(children[i]);

        if (judgeResult === 1) { // TEXT_NODEs, inline elements will be binded into a anonymous paragraph
            let leaves = [children[i]];

            /**
             *  <div>
             *      blabla  - 1
             *      bilibili - 2
             *      <div>
             *          ...
             *      </div>
             *  </div>
             *  in this case, 1&2 will be pushed into a signle anonymous paragraph
             */
            for (i++; i < children.length; i++) {
                if (judgeInline(children[i]) !== 1) {
                    break;
                }
                leaves.push(children[i]);
            }
            i--;

            // anonymous paragraph or nothing when whitespace enabled but this is blank line
            const leafNodes = deserializeLeaves(leaves, css);

            // whiteSpace: prevent blank line
            if (!whiteSpace && leafNodes.some(({ text }) => !RegExpOfAllBlank.test(text))) {
                ans.push(eatCSS({
                    type: 'paragraph',
                    children: leafNodes
                }, css));
            }

        } else if (judgeResult === 2) { // block-level elements: table, list, div

            let css0 = elementStyle(children[i], css);

            if (children[i].nodeName === 'TABLE') {
                ans.push(deserializeTableX(children[i], css0));
            } else if (['LI', 'DT'].includes(children[i].nodeName)) {
                ans.push(deserializeListX(children[i], css0));
            } else {
                // DIVs does not matters, we need deep into the last div which contains inline leaves
                // we divide lines by the last divs
                ans.push(deserializeFragmentX(HTML.childNodes(children[i], { notBlank: false }), css0));
            }

        } else if (judgeResult === 0) {
            // invalid node, do nothing
        }
    }
    if (!ans.length) ans = [defaulta()] // TODO: no empty, no, may be should allow empty when blank space
    return ans.flat();
}

function deserializeTableX(el, css) {
    let tfboys = HTML.childNodes(el);
    if (tfboys.every(n => ['TBODY', 'THEAD', 'TFOOT', 'CAPTION'].includes(n.nodeName))) {

        let trNodesWithCss = tfboys.reduce((arr, tbodyNode) => {
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
                }, css];
            }

            let tbodyCss = elementStyle(tbodyNode, css);
            return [...arr, ...HTML.childNodes(tbodyNode).map(trNode => [trNode, elementStyle(trNode, tbodyCss)])];
        }, []);

        let tdValid = true; // tr includes td/th not other elements
        let maxTdsLen = 0;
        let trs = trNodesWithCss.map(([trNode, trCss]) => { // no matter whether u are really tr, just do it √
            let tdNodes = HTML.childNodes(trNode);

            tdValid = tdValid && tdNodes.every(n => ['TH', 'TD'].includes(n.nodeName));
            maxTdsLen = Math.max(tdNodes.length, maxTdsLen);

            // tr/tbody 's style, only backgroundColor for td (ah, we have backgound inherit approach!)
            return {
                type: 'table-row',
                children: tdNodes.map(tdNode => {
                    // td style? does td's style matters?... cellColor
                    let tdCss = elementStyle(tdNode, trCss);

                    return eatCSS({
                        type: 'table-cell',
                        children: deserializeFragmentX(HTML.childNodes(tdNode), tdCss)
                    }, tdCss);
                })
            }
        });

        // anti-alias
        trs = trs.map(tr => {
            let tdLeft = Array(maxTdsLen - tr.children.length).fill(0).map(
                _ => eatCSS({ type: 'table-cell', children: [{ type: 'paragraph', children: [{ text: '' }] }] }, css) // trCSS not accessable
            );
            return {
                ...tr,
                children: [...tr.children, ...tdLeft]
            }
        })

        if (!tdValid) return defaulta(); // INVALID td / th

        return eatCSS({
            type: 'table',
            children: trs
        }, css)
    } else {
        return defaulta(); // INVALID tbody
    }
}

function deserializeListX(el, css) {
    return eatCSS({
        type: 'bulleted-list',
        children: [
            {
                type: 'list-item',
                children: deserializeFragmentX(HTML.childNodes(el), css)
            }
        ]
    }, css);
}

/**
 * @example
 * <div> 
 *   'aaa' 
 *   <span>
 *      'bbb'
 *   </span>
 * </div>
 * returns: [{text:'aaa'}, {text:'bbb'}]
 * 
 * @param {NodeList|Array} childNodes 
 */
function _deserializeLeaves(childNodes, css) {
    if (!childNodes.length) return [[{ text: '' }, css]]; // not flatted *2, will return array [node, css]

    return childNodes.map(leaf => { // note that if we pass [] to deserializeLeaves, map function will not excuted and return [] and it works well
        if (leaf.nodeType === Node.TEXT_NODE) {
            return [[eatCSS({
                text: leaf.textContent
            }, css), css]]; // not flatted *2, will return array [node, css]
        } else {
            let css0 = elementStyle(leaf, css);
            return _deserializeLeaves(HTML.childNodes(leaf, { notBlank: false }), css0); // not flatted *1, 
        }
    }).flat(); // flat *1
}

function deserializeLeaves(childNodes, css) {
    const notTrimedResult = _deserializeLeaves(childNodes, css);

    // whiteSpace: trim blank leaves
    // NOTE: every span could have different whiteSpace, should use leafCss to calculate whiteSpace
    const trimedResult = notTrimedResult.map(([leaf, leafCss], index, arr) => {
        const { whiteSpace = false } = leafCss;

        let { text } = leaf;
        if (!whiteSpace) {
            // for first or last leaf, trim blanks on start or end, like what browser did
            if (index === 0) {
                text = text.replace(/^[ \n]*/g, '');
            }
            if (index === arr.length - 1) {
                text = text.replace(/[ \n]*$/g, '');
            }
            // for central leaves, collapse blank into one, like what browser did
            text = text.replace(/[ \n]+/g, ' ');
        }
        text = text.replace(/\u00A0/g /** nbsp; */, ' ');
        return {
            ...leaf,
            text
        }
    });

    return trimedResult;
}

function judgeInline(htmlEl) {
    if (htmlEl.nodeType === Node.TEXT_NODE) {
        return 1;
    } else if (htmlEl.nodeType !== Node.ELEMENT_NODE) { // unreconized node type
        return 0;
    }

    const style = htmlEl.style;
    if (ELSM.has(htmlEl.nodeName)) { // block-level element
        if (['inline'].includes(style.display)) { // inline block also inline
            return 1;
        }
        return 2;
    } else if (LFSM.has(htmlEl.nodeName)) { // inline-level tags (UA default), no matter whether it is inline
        // TODO: will getComputedStyle cost CPUs?
        if (['block', 'inline-block', 'inline-flex', 'inline-grid'].includes(style.display)) { // inine block also inline
            return 2;
        }
        return 1;
    }
    return 0; // unreconized node tag
}

const HTML = {
    childNodes(htmlEl, options = { notBlank: true }) {
        if (options.notBlank) {
            return [...htmlEl.childNodes].filter(this.notBlank);
        }
        return [...htmlEl.childNodes];
    },
    notBlank(n) {
        return !(n.nodeType === Node.TEXT_NODE && n.textContent.trim() === "" && n.textContent[0] === '\n');
    }
}

function elementStyle(htmlEl, inheritedStyle) {
    // NOTE: CSS will computed into inline CSS when copy into clipboard, no className
    const {
        font, fontWeight, fontFamily, fontSize, fontStyle, color,
        marginLeft, marginRight,
        textDecoration, textDecorationLine,
        backgroundColor, background,
        whiteSpace
    } = htmlEl.style;

    // UA style sheet
    if (LFSM.has(htmlEl.nodeName)) {
        inheritedStyle = { ...inheritedStyle, ...LFSM.get(htmlEl.nodeName) };
    }

    // table only: border
    if (htmlEl.nodeName === 'TABLE') {
        let td;
        try {
            let tbody = htmlEl.firstElementChild;

            // table - tbody(or caption) - tr - td
            while (tbody !== null && !['TBODY', 'THEAD', 'TFOOT'].includes(tbody.nodeName)) {
                tbody = tbody.nextElementSibling;
            }

            if (['TBODY', 'THEAD', 'TFOOT'].includes(tbody.nodeName)) {
                td = tbody.firstElementChild.firstElementChild;
            }
        } catch (e) {
            // will got exception when table unreconized: tbody/tr/td undefined
        }
        console.log(htmlEl, td);
        if (td && ['TD', 'TH'].includes(td.nodeName)) {
            const { border, borderWidth, borderStyle } = td.style;
            if (
                /** border-width */ Number.parseFloat(borderWidth) === 0 ||
                /** border-style */ (borderStyle !== undefined && ['unset', 'none'].includes(borderStyle.toLowerCase())) ||
                /** border */['unset', 'none', '0in', '0px', '0pt', '0'].some(str => border.toLowerCase().split(' ').includes(str))
            ) {
                inheritedStyle = { ...inheritedStyle, noBorder: true };
            } else {
                inheritedStyle = { ...inheritedStyle, noBorder: false };
            }
        }
    }

    // white-space affects whether enter(\n) and space will preserve
    // we do nothing on Spaces, because Spaces will auto reduce when copy
    // should deal with New-Lines
    if (['pre-wrap', 'break-spaces', 'pre-line'].includes(whiteSpace.toLowerCase())) {
        inheritedStyle = { ...inheritedStyle, whiteSpace: true };
    } else if (['unset', 'normal'].includes(whiteSpace.toLowerCase())) {
        inheritedStyle = { ...inheritedStyle, whiteSpace: false };
    }

    // tabs -> margin-left
    let tabs = inheritedStyle.tabs ? inheritedStyle.tabs : 0;
    if (marginLeft && marginLeft !== marginRight) {
        let float = Number.parseFloat(marginLeft);

        if (marginLeft.toLowerCase().endsWith('px')) { // from web
            tabs += Math.round(float / 100);
        } else if (marginLeft.toLowerCase().endsWith('in')) { // from onenote
            tabs += Math.round(float / .375);
        }
    }
    inheritedStyle = { ...inheritedStyle, tabs };

    // cellColor for table-cell & bgColor for leaves - background
    const judgeResult = judgeInline(htmlEl);
    if ((backgroundColor || background).trim()) {
        if (judgeResult === 1) {
            inheritedStyle = { ...inheritedStyle, bgColor: backgroundColor || background };
        } else if (judgeResult === 2) {
            inheritedStyle = { ...inheritedStyle, cellColor: backgroundColor || background, bgColor: undefined };
        } else if (judgeResult === 0) {
            // do nothing
        }
    }

    // font
    // TODO: font - the short word
    if (fontStyle !== undefined) {
        if (['oblique', 'italic'].includes(fontStyle)) {
            inheritedStyle = { ...inheritedStyle, italic: true };
        } else if (['normal', 'unset'].includes(fontStyle)) {
            inheritedStyle = { ...inheritedStyle, italic: false };
        }
    }
    if (fontWeight !== undefined) {
        if (['500', '600', '700', '800', '900', 'bold', 'bolder'].includes(fontWeight)) {
            inheritedStyle = { ...inheritedStyle, bold: true };
        } else if (['normal', 'unset'].includes(fontWeight)) {
            inheritedStyle = { ...inheritedStyle, bold: false };
        }
    }

    // TODO: not support fontSize & fontFamily
    // fontSize may with px unit, not pt unit, cannot transform
    // fontFamily is an long string

    if (color !== undefined) {
        inheritedStyle = { ...inheritedStyle, fontColor: color };
        if (['unset'].includes(color)) {
            inheritedStyle = { ...inheritedStyle, fontColor: undefined };
        }
    }

    // no inherit
    let textDecorationItems = [textDecorationLine.split(' ')] || textDecoration.split(' ');
    if (textDecoration !== undefined) {
        if (['underline'].includes(textDecorationItems)) {
            inheritedStyle = { ...inheritedStyle, underline: true };
        } else {
            inheritedStyle = { ...inheritedStyle, underline: false };
        }

        if (['line-through'].includes(textDecorationItems)) {
            inheritedStyle = { ...inheritedStyle, underline: true };
        } else {
            inheritedStyle = { ...inheritedStyle, underline: false };
        }
    }

    return inheritedStyle;
}

function eatCSS(el, inheritedStyle, style) {
    style = { ...inheritedStyle, ...style };
    if (Text.isText(el)) {
        return eatCSSLeaf(el, style);
    } else {
        if (matchType('table')(el)) {
            return eatCSSTable(el, style);
        } else if (matchType('paragraph', 'numbered-list', 'bulleted-list')(el)) {
            return eatCSSParagraph(el, style);
        } else if (matchType('table-cell')(el)) {
            return eatCSSTd(el, style);
        } else {
            return el;
        }
    }
}

function eatCSSLeaf(leaf, css) {
    return {
        ...leaf,
        ...filterCSS([
            'fontFamily',
            'fontColor',
            'fontSize',
            'bgColor',
            'bold',
            'italic',
            'underline',
            'strike',
        ], css)
    };
}

function eatCSSParagraph(pre, css) {
    return {
        ...pre,
        ...filterCSS([
            'tabs',
        ], css)
    };
}

function eatCSSTable(table, css) {
    return {
        ...table,
        ...filterCSS([
            'tabs',
            'noBorder'
        ], css)
    };
}
function eatCSSTd(td, css) {
    return {
        ...td,
        ...filterCSS([
            'cellColor'
        ], css)
    };
}

function filterCSS(keys, css) {
    return Object.keys(css).filter(k => keys.includes(k)).reduce((style, k) => ({ ...style, [k]: css[k] }), {});
}

export default deserializeX;