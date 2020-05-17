import React, { useMemo, useState } from 'react';
import { Editable, withReact, Slate } from 'slate-react';
import { CSSTransition } from 'react-transition-group';

import './style.scss';

import Button from '@/components/Button';
import { DropdownButton } from '@/components/DropdownButton';
import { CalendarOutlined, DeleteOutlined, FontSizeOutlined, CreditCardOutlined } from '@ant-design/icons';
import { renderLeaf as Leaf } from '@/components/Editor/createEditor';

import { ToolboxFxFrame } from '../Toolbox/Toolbox';
import { LeafStyleDialog, fromComputedLeafStyle } from './components/LeafStyleDialog.jsx';
import { BaseTableStyleDialog, BLANK, fromComputedTableRules } from './components/TableStyleDialog.jsx';
import { useIdbCustomStyles, useIdbCustomTableStyles, } from '@/utils/userSettings';
import { alt } from '@/utils';
import { v4 as uuid } from 'uuid';

const getView = (page, setPage, map) => {
    const Page = page === 0 ? null : map.get(page)[0];
    return (Page ? <Page back={_ => setPage(0)} /> : null);
}

const SC = _ => {
    const [page, setPage] = useState(0);
    const view = getView(page, setPage, pagesMap);
    return (
        <div className="page-toolbox">
            <CSSTransition
                classNames="ani-toolbox-index"
                in={page === 0}
                timeout={300}
                unmountOnExit
            >
                <SCIndex setPage={i => setPage(i)} />
            </CSSTransition>

            <CSSTransition
                classNames="ani-toolbox-frame"
                in={page !== 0}
                timeout={300}
                unmountOnExit
            >
                <ToolboxFxFrame back={_ => setPage(0)}>
                    {view}
                </ToolboxFxFrame>

            </CSSTransition>
        </div>
    );
}

const SCIndex = ({ setPage }) => {
    return (
        <div className="tools-index">
            <div className="tools-container">
                {
                    [...pagesMap.entries()].map(([k, [Compo, title, desc, Icon]]) => {
                        return (
                            <Button key={k} onClick={_ => setPage(k)}>
                                <div className="tool-info">
                                    <Icon />
                                    <h6>{title}</h6>
                                    <p>{desc}</p>
                                </div>
                            </Button>
                        )
                    })
                }
            </div>
        </div>
    );
}

const FontStylePanel = () => {
    const [leafStyleDialogVisible, setLeafStyleDialogVisible] = useState();
    const [leafStyleDialogValue, setLeafStyleDialogValue] = useState(fromComputedLeafStyle({}));
    const [leafStyleInfo, setLeafStyleInfo] = useState({ title: '', group: '' });
    const [index, setIndex] = useState(-1);

    const [customStyles, setCustomStyles] = useIdbCustomStyles();

    return (
        <div>
            <div className="dialog-style-picker">
                {
                    customStyles.map((leafStyle, i) => (
                        <div
                            key={leafStyle.id}
                            className="leaf-style-card"
                        >
                            <div
                                onClick={_ => {
                                    const { title, group, style } = leafStyle;
                                    setIndex(i);
                                    setLeafStyleDialogValue(fromComputedLeafStyle(style));
                                    setLeafStyleInfo({ title, group });
                                    setLeafStyleDialogVisible(true);
                                }}
                            >
                                <span className='slate-normalize'>
                                    <Leaf leaf={{
                                        ...leafStyle.style,
                                        fontSize: leafStyle.style.fontSize ?
                                            leafStyle.style.fontSize > 12 ?
                                                Math.floor(12 + 1.2 * Math.sqrt(leafStyle.style.fontSize - 12)) :
                                                leafStyle.style.fontSize
                                            : undefined
                                    }}>文字</Leaf>
                                </span>
                                <span>{leafStyle.style.fontSize ? leafStyle.style.fontSize + 'pt' : ''}</span>
                            </div>
                            <h6>{leafStyle.title}</h6>
                            <p>{leafStyle.group}</p>
                            <Button full onClick={_ => {
                                setCustomStyles(customStyles.slice(0, i).concat(customStyles.slice(i + 1)));
                            }}><DeleteOutlined /></Button>
                        </div>
                    ))
                }
            </div>
            <LeafStyleDialog
                visible={leafStyleDialogVisible}
                setVisible={setLeafStyleDialogVisible}
                onApply={(title, group, style) => {
                    setCustomStyles(alt.set(customStyles, index, { title, group, style, id: uuid() }));
                }}
                customLeafStyle={leafStyleDialogValue}
                setCustomLeafStyle={setLeafStyleDialogValue}
                info={leafStyleInfo}
                setInfo={setLeafStyleInfo}
            />
        </div>
    )
}

const TableStylePanel = () => {
    const [visible, setVisible] = useState();
    const [rules, setRules] = useState([]);
    const [info, setInfo] = useState({ title: '', group: '', image: BLANK });
    const [index, setIndex] = useState(-1);

    const [customTableStyles, setCustomTableStyles] = useIdbCustomTableStyles();

    return (
        <div>
            <div className="dialog-table-style-picker">
                {
                    customTableStyles.map((tableStyle, i) => (
                        <div
                            className="table-style-card"
                            key={i}
                        >
                            <div
                                onClick={_ => {
                                    const { title, group, image, rules } = tableStyle;
                                    setIndex(i);
                                    setRules(fromComputedTableRules(rules));
                                    setInfo({ title, group, image });
                                    setVisible(true);
                                }}
                            >
                                <img src={tableStyle.image} />
                            </div>
                            <h6>{tableStyle.title}</h6>
                            <p>{tableStyle.group}</p>
                            <Button full onClick={_ => {
                                setCustomTableStyles(customTableStyles.slice(0, i).concat(customTableStyles.slice(i + 1)));
                            }}><DeleteOutlined /></Button>
                        </div>
                    ))
                }
            </div>
            <BaseTableStyleDialog
                visible={visible}
                setVisible={setVisible}
                onApply={(v) => {
                    setCustomTableStyles(alt.set(customTableStyles, index, { ...v, id: uuid() }));
                }}
                rules={rules}
                setRules={setRules}
                info={info}
                setInfo={setInfo}
            />
        </div>
    )
}

const pagesMap = new Map([
    [FontStylePanel, '文字样式管理', ' ', FontSizeOutlined],
    [TableStylePanel, '表格样式管理', ' ', CreditCardOutlined],
].map((v, i) => [i + 1, v])
)

export default SC;