import React, { useEffect, useState } from 'react';
import { Portal } from '@/components/util';
import { CSSTransition } from 'react-transition-group';
import { CloseOutlined } from '@ant-design/icons';
import Button from '../Button';

// every visible dialog will have z-index great than the prev visible one, reduce z-index when invisible
// z-index dropdown(1100) > dialog(1000+), so do not let 100+ dialog shows at the same time
// not an t o d o: layout manager could also manage zindex for dropdown, or dropdown should portal to it's parent node
let dialogLayoutManager = 1000;

const Dialog = ({
    visible,
    setVisible,
    children,
    full,
    fullWidth,
    paddingBottom,
    keepAlive = false,
    ...others
}) => {

    const [zIndex, setZIndex] = useState(dialogLayoutManager);

    useEffect(_ => {
        if (visible === true) {
            dialogLayoutManager++;
            setZIndex(dialogLayoutManager);
            return _ => dialogLayoutManager--;
        }
    }, [visible]);

    const unmountOnExit = !keepAlive;
    return (
        <Portal>
            <div className='dialog-container' style={{ 'zIndex': zIndex }}>
                <CSSTransition
                    in={visible}
                    timeout={300}
                    classNames='ani-dialog-bg'
                    unmountOnExit={unmountOnExit}
                >
                    <div className={`dialog-bg dialog-bg-on-frame ${visible ? '' : 'hidden'}`}
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
                    <div {...others} className={`dialog dialog-default${full ? ' full' : fullWidth ? ' full-width' : ''}${visible ? '' : ' hidden'}`} >
                        <div className='dialog-close-button'>
                            <Button
                                className='dialog-close-button-inner'
                                onClick={_ => setVisible(false)}
                            >
                                <CloseOutlined />
                            </Button>
                        </div>
                        <div className='dialog-inner'>
                            {children}
                        </div>
                    </div>
                </CSSTransition>
            </div>
        </Portal>
    )
}

export default Dialog;