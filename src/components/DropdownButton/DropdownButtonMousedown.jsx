import React, { useEffect, useRef, useState } from 'react';

import Button from '@/components/MkButton';
import { Portal } from '@/components/util';

import useDropdown from './useDropdown';

const DropdownButton = ({
    active,
    setActive, // just like dialog to translate visible prop to this for programmatical use
    text,
    width,
    dropdownWidth=100,
    renderButton,
    beforeClick,
    renderDropdown = _ => "",
}) => {
    const [buttonRef, top, left] = useDropdown(active, setActive, 'mousedown');

    let btn;
    if (renderButton !== undefined) {
        btn = renderButton(buttonRef);
    } else {
        btn = (
            <Button
            // WARNING: a silly coincidence is while active(class="dropdown") 
            // the button will not be listened by native events of the sideEffects in useDropdown()
            // events will be handled by React, but outside click will be caughted by native event listener
                className={active ? 'dropdown' : ""}
                ref={buttonRef}
                onMouseDown={event => {
                    event.preventDefault();
                    beforeClick && beforeClick();// use beforeClick to save selection for editor
                    setActive(!active);
                }}
                type="plain"
                style={{ width }}
            >
                {text}
            </Button>
        );
    }

    return (
        <>
            {btn}
            <Portal>
                <div
                    className="dropdown"
                    style={{
                        zIndex: 1001,
                        position: "fixed",
                        top,
                        left,
                        border: "1px solid var(--color-onenote)",
                        minWidth: dropdownWidth,
                        display: active ? null : "none"
                    }}>
                    {
                        renderDropdown(setActive)
                    }
                </div>
            </Portal>
        </>
    )
}

export default DropdownButton;