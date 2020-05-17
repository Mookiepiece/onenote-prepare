import React, { useState } from 'react';
import Button from './Button';
import { Portal } from '../util';
import './toolButton.scss';
import { usePosition } from '../DropdownButton/useDropdown';
import { CSSTransition } from 'react-transition-group';

export default React.forwardRef(function ToolButton(props, ref) {
    const { title, children, className, ...others } = props;
    const [visible, setVisible] = useState(false);
    const [_ref, top, left, transform] = usePosition('↓');

    return (
        <div ref={_ref}>
            <Button
                className={"tool-button " + className}
                onMouseEnter={_ => setVisible(true)}
                onMouseLeave={_ => setVisible(false)}
                {...others}
                ref={ref}
            >
                {children}
                {
                    title ? (
                        <Portal>
                            <CSSTransition
                                in={visible}
                                timeout={100}
                                classNames='ani-tool-button-tooltip'
                                mountOnEnter
                            >
                                <div
                                    className="tool-button-tooltip"
                                    style={{
                                        top: top + 4,
                                        left,
                                        transform
                                    }}>
                                    <span>{title}</span>
                                </div>
                            </CSSTransition>
                        </Portal>
                    ) : null
                }

            </Button>
        </div>
    )
});
