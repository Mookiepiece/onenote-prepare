import React, { useEffect, useRef, useState } from 'react';
import { Portal, closest } from '@/components/util';
import { CSSTransition } from 'react-transition-group';

import Button from '@/components/MkButton';

import {
    RightOutlined
} from '@ant-design/icons';

const AsideDialog = ({
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
                    classNames='ani-aside-dialog'
                    unmountOnExit
                >
                    <div {...others} className="dialog aside-dialog">
                        {children}
                        <Button
                            type="floating"
                            className="aside-dialog-button-close"
                            full
                            onClick={_ => setVisible(false)}
                        ><RightOutlined /></Button>
                    </div>
                </CSSTransition>
            </div>
        </Portal>
    )
}

export default AsideDialog;