import React, { useEffect, useRef, useState } from 'react';
import { Portal, closest } from '@/components/util';
import { CSSTransition } from 'react-transition-group';
const Dialog = ({
    visible,
    setVisible,
    children,
    full,
    unmountOnExit = true,
    ...others
}) => {
    return (
        <Portal>
            <div>
                <CSSTransition
                    in={visible}
                    timeout={300}
                    classNames='ani-dialog-bg'
                    unmountOnExit={unmountOnExit}
                >
                    <div className={`dialog-bg dialog-bg-no-poiner-event ${visible ? '' : 'hidden'}`}
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
                    unmountOnExit={unmountOnExit}
                >
                    <div className={`dialog-bg ${visible ? '' : 'hidden'}`}
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
                    unmountOnExit={unmountOnExit}
                >
                    <div {...others} className={`dialog dialog-default ${full ? 'full' : null} ${visible ? '' : 'hidden'}`}>
                        {children}
                    </div>
                </CSSTransition>
            </div>
        </Portal>
    )
}

export default Dialog;