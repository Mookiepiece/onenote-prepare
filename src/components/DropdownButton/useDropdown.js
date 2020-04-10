import { useState, useRef, useEffect } from 'react';
import { closest } from '@/components/util';

/**
 * 
 * @param {*} panelActive 
 * @param {*} setPanelActive 
 * @param {String} eventName trigger
 */
const useDropdown = (panelActive, setPanelActive, eventName = "click") => {
    const buttonRef = useRef();
    let top = 0;
    let left = 0;

    //click anywhere to hide dropdown
    useEffect(_ => {
        if (panelActive) {
            const handler = event => {
                const delegateTarget = closest(event.target, '.__dropdown');
                if (delegateTarget) {
                    return;
                }
                setPanelActive(false);
                document.body.removeEventListener(eventName, handler);
            }

            document.body.addEventListener(eventName, handler);
            return _ => {
                document.body.removeEventListener(eventName, handler);
            }
        }
    }, [panelActive, setPanelActive]);

    if (panelActive) {
        const rect = buttonRef.current.getBoundingClientRect();
        top = rect.top + rect.height;
        left = rect.left;
    }

    return [buttonRef, top, left];
}

export default useDropdown;