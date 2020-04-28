import React, { useState } from 'react';
import {
    CSSTransition,
    TransitionGroup,
} from 'react-transition-group';
import { useSlate } from 'slate-react';
import {
    CloseOutlined,
    BorderOutlined,
    CheckSquareOutlined,
    PlusCircleOutlined
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

const applyChange = (editor, state, setSlateValue) => {
    applyMatcher(editor, state)
    applyRender(editor, state.v.result, setSlateValue,state.v.matches[setSlateValue,state.v.matches.length - 1].outType);
    return state;
};

const applyMatcher = (editor, state) => {
    clearUp(editor);
    const ranges = state.v.matches.reduce((prevRanges, v) => { return v.match(editor, prevRanges, v.inputs) }, []);
    applyMatch(editor, ranges);
    return state;
};

//current 正在match，新建的话自动apply, apply已拥有
const Aside = ({ setSlateValue, readOnly, state, dispatch: _dispatch }) => {
    const editor = useSlate();

    const [dialogVisible, setDialogVisible] = useState(false);
    const [dialogPushTransform, setDialogPushTransform] = useState(false);

    let dispatch = arg => _dispatch({
        ...arg,
        callback: {
            match: state => applyMatcher(editor, state),
            change: state => applyChange(editor, state, setSlateValue),
            clear: _ => clearUp(editor),
            children: _ => editor.children,
            slate: value => setSlateValue(value),
        }
    });

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
                                setDialogPushTransform(true);
                            }}
                            style={{ marginBottom: 12 }}
                        >添加规则</Button>
                        :
                        <Button
                            full
                            onClick={_ => dispatch({ type: ActionTypes.DELETE })}
                            style={{ marginBottom: 12 }}
                        >删除规则</Button>
                }

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
                                        setDialogPushTransform(false);
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
                        pushTransform: dialogPushTransform
                    });
                    setDialogVisible(false);
                }} />
            </div>
            <div className="aside-bottom">
                <Button
                    type="floating"
                    onClick={_ => dispatch({ type: ActionTypes.APPLY })}
                    style={{ marginBottom: 12, display: readOnly && state.v.result.nodes.length !== 0 ? null : 'none' }}
                >应用规则</Button>
            </div>
        </aside >
    )
}

const TransformCard = ({ v, onClose, onTogglePreview, onInput, onMatch, onOpenDialog }) => {
    let color = v.isApplied ? 'applied' : 'unused';
    let className = `transform-card${' ' + color}`;

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
            <Button className="add-match-button" onClick={onOpenDialog} disabled ><PlusCircleOutlined /></Button>
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
