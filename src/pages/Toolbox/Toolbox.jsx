import React, { useState } from 'react';
import './style.scss';
import Button from '@/components/MkButton';
import { LeftOutlined, CalendarOutlined } from '@ant-design/icons';
import DateRangePicker from '@wojtekmaj/react-daterange-picker';
import { Switch } from '@/components/Switch';
import { TinyEmitter, EVENTS } from '@/utils';
import dateformat from 'dateformat';
import Input from '@/components/Input';
import { renderLeaf as Leaf } from '@/components/Editor/createEditor';
import { useRouterContext } from '@/App';
import { CSSTransition } from 'react-transition-group';


const getView = (page, setPage, map) => {
    const Page = page === 0 ? null : map.get(page)[0];
    return (Page ? <Page back={_ => setPage(0)} /> : null);
}

const Toolbox = _ => {
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
                <ToolboxIndex setPage={i => setPage(i)} />
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

const ToolboxIndex = ({ setPage }) => {
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

export const ToolboxFxFrame = ({ back, children }) => {
    return (
        <div className="tools-frame">
            <nav><Button full onClick={back}><LeftOutlined /></Button></nav>
            <div>
                {children}
            </div>
        </div>
    );
}

const emptyRow = _ => ({
    type: 'table-row',
    children: [{
        type: 'table-cell',
        children: [{ type: 'paragraph', children: [{ text: '' }] }]
    }]
})

const emptyCell = (text = '') => ({
    type: 'table-cell',
    children: [{ type: 'paragraph', children: [{ text }] }]
})

const FxCalendarTable = ({ back }) => {
    const [dateRange, setDateRange] = useState([new Date(), new Date()]);

    let dateRangeInt = (dateRange && dateRange[0]) ? parseInt((dateRange[1].getTime() - dateRange[0].getTime()) / 1000 / 60 / 60 / 24) + 1 : null;
    const [type, setType] = useState(0);
    const [spaceCol, setSpaceCol] = useState(false);
    const [format, setFormat] = useState('yy-mm-dd');

    const [routerValue, setRouterValue] = useRouterContext();

    let errmsg = "";
    if (dateRangeInt === null)
        errmsg = "日期必填";
    else {
        const dataRangeExceed = dateRangeInt > 366;
        if (dataRangeExceed) {
            errmsg = "范围不能超过一年";
        }
    }

    const handleClick = _ => {
        let table;

        let _date = new Date(dateRange[0]);
        function get() {
            let result = dateformat(_date, format);
            _date.setDate(_date.getDate() + 1);
            return result;
        }

        if (type === 0) {
            table = {
                type: 'table',
                children: [...Array(dateRangeInt).keys()].map(i => {
                    let arr = [{
                        type: 'table-row',
                        children: [{
                            type: 'table-cell',
                            children: [{
                                type: 'paragraph', children: [{ text: get() }]
                            }]
                        }]
                    }]

                    if (spaceCol) {
                        arr.push(emptyRow());
                    }
                    return arr;
                }).flat()
            };

        } else {
            const trArr = [];
            let day = dateRange[0].getDay(); // 1~6,0 -> 1~7
            if (day === 0)
                day = 7;

            let prefixTr = Array(day - 1).fill('');
            trArr.push(prefixTr);

            for (let i = 0; i < dateRangeInt; i++) {
                if (trArr[trArr.length - 1].length === 7) {
                    trArr.push([]);
                }
                let tdArr = trArr[trArr.length - 1];

                tdArr.push(get());
            }

            let afterfixTds = Array(7 - trArr[trArr.length - 1].length).fill('');
            trArr[trArr.length - 1].push(...afterfixTds);

            table = {
                type: 'table',
                children: trArr.map(tdArr => {
                    if (spaceCol)
                        return [{
                            type: 'table-row',
                            children: tdArr.map(emptyCell)
                        }, {
                            type: 'table-row',
                            children: tdArr.map(_ => emptyCell())
                        }]
                    else
                        return {
                            type: 'table-row',
                            children: tdArr.map(emptyCell)
                        }
                }).flat()
            }
        }

        back();
        setRouterValue(0);
        TinyEmitter.emit(EVENTS.TOOLBOX_APPLY, [table]);
    };

    return (
        <div className="fx-calendar-table">
            <div>
                <br />
                <div className="form-like">
                    <span>日历范围</span>
                    <div>
                        <DateRangePicker
                            value={dateRange}
                            onChange={setDateRange}
                        />
                    </div>
                    <span>类型</span>
                    <div>
                        <Button type={type === 0 ? "primary" : ''} onClick={_ => setType(0)}>线性</Button>
                        <Button type={type === 1 ? "primary" : ''} onClick={_ => setType(1)}>表格式</Button>
                    </div>
                    <span>附加空行</span>
                    <Switch value={spaceCol} onChange={setSpaceCol} />
                    <span>格式</span>
                    <Input value={format} onChange={setFormat} />
                    {/* <Switch value={spaceRow} onChange={setSpaceRow}>附加空列</Switch> */}
                </div>
                <Button
                    full
                    type="primary"
                    disabled={errmsg}
                    onClick={handleClick}
                >提交</Button>
                {
                    errmsg ? <span className="err-msg">{errmsg}</span> : null
                }
            </div>
            <div>
                <div className="slate-normalize">
                    {
                        dateRangeInt ?
                            type === 0 ? (
                                <table>
                                    <tbody>
                                        <tr>
                                            <td>
                                                <pre><Leaf leaf={{}}>{dateformat(dateRange[0], format)}</Leaf></pre>
                                            </td>
                                        </tr>
                                        {
                                            spaceCol ? (
                                                <tr>
                                                    <td>
                                                        <pre><Leaf leaf={{}}> </Leaf></pre>
                                                    </td>
                                                </tr>
                                            ) : null
                                        }
                                        <tr>
                                            <td>
                                                <pre><Leaf leaf={{}}>...</Leaf></pre>
                                            </td>
                                        </tr>
                                        {
                                            spaceCol ? (
                                                <tr>
                                                    <td>
                                                        <pre><Leaf leaf={{}}> </Leaf></pre>
                                                    </td>
                                                </tr>
                                            ) : null
                                        }
                                        <tr>
                                            <td>
                                                <pre><Leaf leaf={{}}>...</Leaf></pre>
                                            </td>
                                        </tr>
                                        {
                                            spaceCol ? (
                                                <tr>
                                                    <td>
                                                        <pre><Leaf leaf={{}}> </Leaf></pre>
                                                    </td>
                                                </tr>
                                            ) : null
                                        }

                                        <tr>
                                            <td>
                                                <pre><Leaf leaf={{}}>{dateformat(dateRange[1], format)}</Leaf></pre>
                                            </td>
                                        </tr>

                                        {
                                            spaceCol ? (
                                                <tr>
                                                    <td>
                                                        <pre><Leaf leaf={{}}> </Leaf></pre>
                                                    </td>
                                                </tr>
                                            ) : null
                                        }
                                    </tbody>
                                </table>
                            ) : (
                                    <table>
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <pre><Leaf leaf={{}}>{dateformat(dateRange[0], format)}</Leaf></pre>
                                                </td>
                                                {[...new Array(6).keys()].map(i => (
                                                    <td key={i}>
                                                        <pre><Leaf leaf={{}}>...</Leaf></pre>
                                                    </td>
                                                ))}
                                            </tr>
                                            {
                                                spaceCol ? (
                                                    <tr>
                                                        {[...Array(7).keys()].map(i => (
                                                            <td key={i}>
                                                                <pre><Leaf leaf={{}}> </Leaf></pre>
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ) : null
                                            }
                                            <tr>
                                                {[...new Array(6).keys()].map(i => (
                                                    <td key={i}>
                                                        <pre><Leaf leaf={{}}>...</Leaf></pre>
                                                    </td>
                                                ))}

                                                <td>
                                                    <pre><Leaf leaf={{}}>{dateformat(dateRange[1], format)}</Leaf></pre>
                                                </td>
                                            </tr>
                                            {
                                                spaceCol ? (
                                                    <tr>
                                                        {[...Array(7).keys()].map(i => (
                                                            <td key={i}>
                                                                <pre><Leaf leaf={{}}> </Leaf></pre>
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ) : null
                                            }
                                        </tbody>
                                    </table>
                                )
                            : (
                                null
                            )
                    }
                </div>
            </div>
            <div>
                <p>预览：</p>
            </div>
        </div>
    );
}

const pagesMap = new Map([
    [FxCalendarTable, '日历', '生成日历表格', CalendarOutlined]
].map((v, i) => [i + 1, v])
)

export default Toolbox;