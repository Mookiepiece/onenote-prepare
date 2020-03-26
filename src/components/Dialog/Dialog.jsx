import React, { useEffect, useRef, useState } from 'react';
import { Portal, closest } from '@/components/util';
import { CSSTransition } from 'react-transition-group';
const Dialog = ({
    visible,
    setVisible,
    children,
    ...others
}) => {
    return (
        <Portal>
            <div>
                <CSSTransition
                    in={visible}
                    timeout={300}
                    classNames='ani-dialog-bg'
                    unmountOnExit
                >
                    <div className="dialog-bg-no-poiner-event"
                        onMouseDown={_ => {
                            setVisible(false);
                        }}
                    >
                    </div>
                </CSSTransition>
                <CSSTransition
                    in={visible}
                    timeout={300}
                    classNames='ani-dialog-bg'
                    unmountOnExit
                >
                    <div className="dialog-bg"
                        onMouseDown={_ => {
                            setVisible(false);
                        }}
                    >
                    </div>
                </CSSTransition>
                <CSSTransition
                    in={visible}
                    timeout={300}
                    classNames='ani-dialog'
                    unmountOnExit
                >
                    <div {...others} className="dialog dialog-default">
                        {children}
                    </div>
                </CSSTransition>
            </div>
        </Portal>
    )
}

export default Dialog;