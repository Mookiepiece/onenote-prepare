import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

import Button from '@/components/MkButton';

const Portal = ({ children }) => {
    return (
        ReactDOM.createPortal(children, document.body)
    )
}

const DropdownButton = ({
    value,
    options = [],
    action,
    width,
    renderLabel = ({ label }) => (<span>{label}</span>),
    beforeClick = _ => { }
}) => {
    const [panelActive, setPanelActive] = useState();
    const buttonRef = useRef();

    let top = 0;
    let left = 0;

    if (panelActive) {
        const rect = buttonRef.current.getBoundingClientRect();
        console.log(rect);
        top = rect.top + rect.height;
        left = rect.left;
    }

    const renderOptions = (option) => (
        <Button
            full
            key={option.value}
            onMouseDown={
                event => {
                    event.preventDefault();
                    action(option.value);
                    setPanelActive(false);
                }
            }
        >{renderLabel(option)}</Button>
    )

    return (
        <>
            <Button
                ref={buttonRef}
                onMouseDown={event => {
                    event.preventDefault();
                    beforeClick();
                    setPanelActive(!panelActive);
                }}
                type="plain"
                style={{ width }}
            >{value}</Button>
            <Portal>
                <div
                    style={{
                        zIndex: 1000,
                        position: "absolute",
                        top,
                        left,
                        border: "1px solid salmon",
                        width: "25%",
                        mixHeight: 100,
                        background: 'pink',
                        display: panelActive ? "block" : "none"
                    }}>
                    {
                        options.map(renderOptions)
                    }
                </div>
            </Portal>
        </>
    )
}

export default DropdownButton;