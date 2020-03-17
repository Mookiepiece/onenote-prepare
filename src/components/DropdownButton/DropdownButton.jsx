import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

import Button from '@/components/MkButton';

/**
 * copy from slate.js
 * create React portal on body
 */
const Portal = ({ children }) => {
    return (
        ReactDOM.createPortal(children, document.body)
    )
}

/**
 * copy from npm - delegate
 * Finds the closest parent that matches a selector.
 *
 * @param {Element} element
 * @param {String} selector
 * @return {Function}
 */
function closest(element, selector) {
    while (element && element !== document.body) {
        if (
            typeof element.matches === 'function' &&element.matches(selector)
        ) {
            return element;
        }
        element = element.parentNode;
    }
    return;
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


    //click anywhere to hide dropdown
    useEffect(_ => {
        const handler = event => {
            const delegateTarget = closest(event.target, '.dropdown');
            if (delegateTarget) {
                return;
            }
            setPanelActive(false);
            document.body.removeEventListener('mousedown', handler);
        }
        if (panelActive) {
            document.body.addEventListener('mousedown', handler);
        }
        return _ => {
            document.body.removeEventListener('mousedown', handler);
        }
    }, [panelActive]);

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
                className="dropdown"
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
                    className="dropdown"
                    style={{
                        zIndex: 1001,
                        position: "fixed",
                        top,
                        left,
                        border: "1px solid salmon",
                        width: "25%",
                        mixHeight: 100,
                        display: panelActive ? null : "none"
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