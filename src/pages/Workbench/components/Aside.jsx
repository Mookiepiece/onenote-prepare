import React, { useState, useEffect } from 'react';
import {
    CSSTransition,
    TransitionGroup,
} from 'react-transition-group';
import { useSlate } from 'slate-react';
import {
    CloseOutlined,
    BorderOutlined,
    CheckSquareOutlined,
    PlusCircleOutlined,
    CopyOutlined
} from '@ant-design/icons';

import { MGet } from '../transforms';
import { applyMatch, clearUp, applyRender } from '../transforms/slateEffects';

import Button from "@/components/MkButton";
import ExtraToolbar from './ExtraToolbar';
import MatchPickerDialog from './MatchPickerDialog';
import ResultPanel from './ResultPanel';
import { connect } from 'react-redux';

import ActionTypes from '@/redux/actions';

import './style.scss';
import { TinyEmitter, EVENTS } from '@/utils';
import Dialog from '@/components/Dialog/Dialog';
import Input from '@/components/Input';
import { pushCustomTransform } from '@/utils/userSettings';

const applyChange = (editor, state, setSlateValue) => {
    applyMatcher(editor, state)
    applyRender(editor, state.v.result, setSlateValue, state.v.matches[setSlateValue, state.v.matches.length - 1].outType);
    return state;
};

const applyMatcher = (editor, state) => {
    clearUp(editor);

    // TODO: co matches
    const ranges = state.v.matches.reduce((prevRanges, v) => { return v.match(editor, prevRanges, v.inputs) }, []);
    applyMatch(editor, ranges);
    return state;
};

//current 正在match，新建的话自动apply, apply已拥有
const Aside = ({ setSlateValue, readOnly, state, dispatch: _dispatch }) => {
    const [dialogVisible, setDialogVisible] = useState(false);
    const [saveRuleDialogVisible, setSaveRuleDialogVisible] = useState(false);

    const editor = useSlate();
    const dispatch = arg => _dispatch({
        ...arg,
        callback: {
            match: state => applyMatcher(editor, state),
            change: state => applyChange(editor, state, setSlateValue),
            clear: _ => clearUp(editor),
            children: _ => editor.children,
            slate: value => setSlateValue(value),
        }
    });

    useEffect(_ => {
        const handler = ({ value, result }) => {
            dispatch({
                type: ActionTypes.PUSH_MATCH_RULE,
                value,
                result
            })
        }
        TinyEmitter.on(EVENTS.PREPARED_TRANSFORM, handler);
        return _ => TinyEmitter.off(EVENTS.PREPARED_TRANSFORM, handler);
    }, []);

    return (
        <aside>
            <div className="workbench-aside">
                <ExtraToolbar readOnly={readOnly} setSlateValue={setSlateValue} />
                {
                    state.v === null ?
                        <Button
                            full
                            onClick={e => {
                                // prepare for switch editor 
                                // NOTE: if current editor still got the selection when we unmount that editable editor
                                // slate&react will emit: can't perform a React state update on an unmounted component.
                                // selection and focus can both exit at the same time so focus() does not work
                                // NOTE: SELECTION
                                window.getSelection().removeAllRanges();
                                setDialogVisible(true);
                            }}
                            style={{ marginBottom: 12 }}
                        >新建替换</Button>
                        : (
                            <>
                                <Button
                                    full
                                    onClick={_ => dispatch({ type: ActionTypes.DELETE })}
                                    style={{ marginBottom: 12 }}
                                >删除替换</Button>
                                <Button
                                    full
                                    onClick={_ => setSaveRuleDialogVisible(true)}
                                    style={{ marginBottom: 12 }}
                                >保存自定义替换</Button>
                            </>
                        )
                }
                <SaveRuleDialog visible={saveRuleDialogVisible} setVisible={setSaveRuleDialogVisible} v={state.v} />

                <TransitionGroup component={null}>
                    {
                        state.v !== null && [state.v].map((v) => (
                            <CSSTransition
                                key={v.key}
                                timeout={300}
                                classNames="transform-card"
                            >
                                <TransformCard
                                    v={v}

                                    onInput={(inputs, rematch = false, matchIndex) => dispatch({
                                        type: ActionTypes.INPUT,
                                        inputs,
                                        rematch,
                                        matchIndex
                                    })}

                                    key={v.key}

                                    onOpenDialog={_ => {
                                        setDialogVisible(true);
                                    }}

                                    onClose={_ => dispatch({
                                        type: ActionTypes.DELETE,
                                    })}

                                    onTogglePreview={
                                        _ => dispatch({
                                            type: ActionTypes.TOGGLE_PREVIEW,
                                        })
                                    }

                                    onMatch={
                                        _ => dispatch({
                                            type: ActionTypes.MATCH,
                                        })
                                    }
                                />
                            </CSSTransition>
                        )).reverse()
                    }
                </TransitionGroup>
                <MatchPickerDialog visible={dialogVisible} setVisible={setDialogVisible} onApply={(i) => {
                    dispatch({
                        type: ActionTypes.PUSH_MATCH_RULE,
                        value: MGet(i),
                    });
                    setDialogVisible(false);
                }} />
            </div>
            <div className="aside-bottom">
                <Button
                    type="floating"
                    onClick={_ => dispatch({ type: ActionTypes.APPLY })}
                    style={{ marginBottom: 12, display: readOnly && state.v.result.nodes.length !== 0 ? null : 'none' }}
                >应用替换</Button>
                <Button
                    onClick={e => {
                        e.preventDefault();
                        TinyEmitter.emit(EVENTS.CLIPBOARD_COPY)
                    }}
                    style={{ display: !readOnly ? null : 'none' }}
                >复制<CopyOutlined /></Button>
            </div>
        </aside>
    )
}

const SaveRuleDialog = ({ visible, setVisible, v }) => {
    const [title, setTitle] = useState('');
    return (
        <Dialog visible={visible} setVisible={setVisible}>
            <p>保存替换规则</p>
            <div className="form-like">
                <span>标题 *</span>
                <div><Input value={title} onChange={setTitle} /></div>
            </div>
            <Button disabled={!title.trim()} onClick={_ => {
                pushCustomTransform({
                    title,
                    value: {
                        id: v.matches[0].id,
                        inputs: v.matches[0].inputs,
                        result: v.result
                    }
                });
                setVisible(false);
            }} full>保存</Button>
        </Dialog>
    );
}

TinyEmitter.on(EVENTS.CLIPBOARD_COPY, data => {
    let workbench = document.getElementById('workbench');

    let editable = workbench.firstElementChild.firstElementChild.nextElementSibling.firstElementChild;

    let div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.width = "100%";
    div.style.height = "100%";
    div.style.zIndex = '1000000';
    div.style.backgroundColor = "powderblue";
    div.style.top = '0';
    div.style.left = '0';
    div.className = "slate-normalize-clipboard";

    document.body.appendChild(div);

    // 炫技行为请勿模仿
    let observer = new MutationObserver(mutationsList => {
        // mutation observer is a micro task
        // which means... before the next render process, we had already completed our copy and removed that
        // but... execCommand is also a micro task? or means that it is sync 

        observer.disconnect();

        var selection = window.getSelection();
        var range = document.createRange();
        range.selectNodeContents(div);
        selection.removeAllRanges();
        selection.addRange(range);

        document.execCommand('copy');
        document.body.removeChild(div);
    });

    observer.observe(div, { childList: true });

    div.innerHTML = editable.innerHTML;
});

const TransformCard = ({ v, onClose, onTogglePreview, onInput, onMatch, onOpenDialog }) => {
    let color = v.isApplied ? 'applied' : 'unused';
    let className = `transform-card${' ' + color}`;

    useEffect(_ => {
        setTimeout(_ => onInput({}, true, 0), 0); // WARNING: settimeout hack
    }, []);

    return (
        <div className={className}>
            <div className="title">
                <Button onClick={onClose} className="close-button"><CloseOutlined /></Button>
            </div>
            <div className="active-info" onMouseDown={onTogglePreview}></div>
            <TransitionGroup className="content-matches">
                {
                    v.matches.map((v, i) => {
                        let V = v.render;
                        return (
                            <CSSTransition
                                key={v.key}
                                timeout={300}
                                classNames="match-item"
                            >
                                <div className="match-item" >
                                    <p className="match-item-title">✨{v.title}</p>
                                    <V
                                        inputs={v.inputs}
                                        onInput={(inputs, rematch) => onInput(inputs, rematch, i)}
                                        onMatch={onMatch}
                                        onApply={onTogglePreview}
                                    />
                                </div>
                            </CSSTransition>

                        );
                    })
                }
            </TransitionGroup>
            <Button onClick={onOpenDialog} disabled ><PlusCircleOutlined /></Button>
            {
                v.matches.length ?
                    (
                        <ResultPanel
                            result={v.result}
                            onResultChange={result => onInput(result, false, -1)}
                        />
                    )
                    : null
            }
            <Button onClick={onTogglePreview} full className="apply-transform-button">{color === 'applied' ? <CheckSquareOutlined /> : <BorderOutlined />}</Button>
        </div>
    )
}

const mapStateToProps = state => ({
    state: state.workbenchAside
})

export default connect(mapStateToProps)(Aside);
