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


import { deepCopy, alt } from '@/utils';

import { MGet } from '../transforms';
import { applyMatch, clearUp, applyRender } from '../transforms/slateEffects';

import Button from "@/components/MkButton";
import ExtraToolbar from './ExtraToolbar';
import DialogMatchPicker from './DialogMatchPicker';
import ResultPanel from './ResultPanel';
import { connect } from 'react-redux';
let matchedRanges = [];

import ActionTypes from '@/redux/actions';

import './style.scss';

const applyChange = (editor, state, index = state.currentIndex) => {
    applyMatcher(editor, state, index)
    applyRender(editor, state.v[index].result);
    return alt.push(state, `memory`, deepCopy(editor.children));
};

const applyMatcher = (editor, state, index = state.currentIndex) => {
    clearUp(editor);
    const v = state.v[index];
    const ranges = v.matches.reduce((prevRanges, v, i) => { return v.match(editor, matchedRanges, v.inputs) }, []);
    applyMatch(editor, ranges);
    return state;
};

const currentState = state => {
    if (state.memory.length > state.currentIndex + 1)
        return 'applied';
    else
        return 'current';
};

//current 正在match，新建的话自动apply, apply已拥有
const Aside = ({ setSlateValue, state, dispatch: _dispatch }) => {
    const editor = useSlate();
    // const [state, _dispatch] = useAsideState({
    //     v: [],
    //     memory: [[{ type: 'paragraph', children: [{ text: '' }] }]],
    //     currentIndex: null,
    // }, setSlateValue);

    console.log(state);

    const [dialogVisible, setDialogVisible] = useState(false);
    const [dialogPushTransform, setDialogPushTransform] = useState(false);

    let dispatch = arg => _dispatch({
        ...arg,
        callback: {
            match: state => applyMatcher(editor, state),
            change: state => applyChange(editor, state),
            slate: value => setSlateValue(value)
        }
    });

    return (
        <aside>
            <div className="workbench-aside">
                <ExtraToolbar />
                <Button
                    full
                    onClick={_ => {
                        setDialogVisible(true);
                        setDialogPushTransform(true);
                    }}
                    style={{ marginBottom: 12 }}
                >添加规则</Button>
                <TransitionGroup component={null}>
                    {
                        state.v.map((v, index) => (
                            <CSSTransition
                                key={v.key}
                                timeout={300}
                                classNames="transform-card"
                            >
                                <TransformCard
                                    v={v}

                                    onInput={(inputs, rematch = false, matchIndex) => dispatch({
                                        type: ActionTypes.INPUT,
                                        index,
                                        inputs,
                                        rematch,
                                        matchIndex
                                    })}

                                    key={v.key}

                                    color={
                                        ((() => {
                                            if (index < state.currentIndex) {
                                                return 'applied';
                                            } else if (index > state.currentIndex) {
                                                return 'unused';
                                            } else {
                                                return currentState(state);
                                            }
                                        })())
                                    }

                                    onOpenDialog={_ => {
                                        dispatch({
                                            type: ActionTypes.SET_CURRENT_INDEX,
                                            index
                                        })
                                        setDialogVisible(true);
                                        setDialogPushTransform(false);
                                    }}

                                    onClose={_ => dispatch({
                                        type: ActionTypes.DELETE,
                                        index
                                    })}

                                    onActive={
                                        _ => dispatch({
                                            type: ActionTypes.TOGGLE_ACTIVE,
                                            index
                                        })
                                    }

                                    onMatch={
                                        _ => dispatch({
                                            type: ActionTypes.MATCH,
                                            index
                                        })
                                    }

                                    onApply={
                                        _ => dispatch({
                                            type: ActionTypes.APPLY,
                                            index
                                        })
                                    }
                                />
                            </CSSTransition>
                        )).reverse()
                    }
                </TransitionGroup>
                <DialogMatchPicker visible={dialogVisible} setVisible={setDialogVisible} onApply={(i) => {
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
                    onClick={_ => {
                        setDialogVisible(true);
                        setDialogPushTransform(true);
                    }}
                    style={{ marginBottom: 12 }}
                >应用规则</Button>
            </div>
        </aside >
    )
}

const TransformCard = ({ v, color, onClose, onActive, onInput, onMatch, onOpenDialog, onApply }) => {
    let className = `transform-card${' ' + color}`;

    return (
        <div className={className}>
            <div className="title">
                <Button onClick={onClose} className="close-button"><CloseOutlined /></Button>
            </div>
            <div className="active-info" onMouseDown={onActive}></div>
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
                                        color={color}
                                        inputs={v.inputs}
                                        onInput={(inputs, rematch) => onInput(inputs, rematch, i)}
                                        onMatch={onMatch}
                                        onApply={onApply}
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
            <Button onClick={onActive} full className="apply-transform-button">{color === 'applied' ? <CheckSquareOutlined /> : <BorderOutlined />}</Button>
        </div>
    )
}

const mapStateToProps = state => ({
    state: state.workbenchAside
})

export default connect(mapStateToProps)(Aside);
