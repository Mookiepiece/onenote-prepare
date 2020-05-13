import React, { useMemo, useState } from 'react';
import { Editable, withReact, Slate } from 'slate-react';
import { CSSTransition } from 'react-transition-group';

import './style.scss';

import Button from '@/components/MkButton';
import { DropdownButton } from '@/components/DropdownButton';
import { CalendarOutlined } from '@ant-design/icons';
import { renderLeaf as Leaf } from '@/components/Editor/createEditor';

import { ToolboxFxFrame } from '../Toolbox/Toolbox';
import { LeafStyleDialog, fromStyle } from './components/LeafStyleDialog.jsx';
import { customStyles, altCustomStyle } from '@/utils/userSettings';
import { alt } from '@/utils';
import { v4 as uuid } from 'uuid';

const getView = (page, map) => {
    const Page = page === 0 ? null : map.get(page)[0];
    return (Page ? <Page back={_ => setPage(0)} /> : null);
}

const SC = _ => {
    const [page, setPage] = useState(0);
    const view = getView(page, pagesMap);
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
                                <div>
                                    <Icon />
                                    <div>
                                        <h6>{title}</h6>
                                        <p>{desc}</p>
                                    </div>
                                </div>
                            </Button>
                        )
                    })
                }
            </div>
        </div>
    );
}

const FxCalendarTable = () => {
    const [leafStyleDialogVisible, setLeafStyleDialogVisible] = useState();
    const [leafStyleDialogValue, setLeafStyleDialogValue] = useState(fromStyle({}));
    const [leafStyleInfo, setLeafStyleInfo] = useState({ title: '', group: '' });
    const [index, setIndex] = useState(-1);

    return (
        <div>
            <div className="dialog-style-picker">
                {
                    customStyles.map((leafStyle, i) => (
                        <div
                            key={leafStyle.id}
                            className="leaf-style-card"
                            onClick={_ => {
                                const { title, group, style } = leafStyle;
                                setIndex(i);
                                setLeafStyleDialogValue(fromStyle(style));
                                setLeafStyleInfo({ title, group });
                                setLeafStyleDialogVisible(true);
                            }}
                        >
                            <div>
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
                        </div>
                    ))
                }
            </div>
            <LeafStyleDialog
                visible={leafStyleDialogVisible}
                setVisible={setLeafStyleDialogVisible}
                onApply={(title, group, style) => {
                    altCustomStyle(alt.set(customStyles, index, { title, group, style, id: uuid() })).then(
                        _ => setIndex(-1) // refresh
                    );
                }}
                customLeafStyle={leafStyleDialogValue}
                setCustomLeafStyle={setLeafStyleDialogValue}
                info={leafStyleInfo}
                setInfo={setLeafStyleInfo}
            />
        </div>
    )
}

const pagesMap = new Map([
    [FxCalendarTable, '文字样式管理', '/', CalendarOutlined]
].map((v, i) => [i + 1, v])
)

export default SC;