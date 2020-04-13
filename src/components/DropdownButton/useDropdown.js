import { useState, useRef, useEffect } from 'react';
import { closest } from '@/components/util';

/**
 * 
 * @param {*} panelActive 
 * @param {*} setPanelActive 
 * @param {String} eventName trigger
 */
const useDropdown = (panelActive, setPanelActive, eventName = 'click', position = '↘') => {
    const buttonRef = useRef();
    let top = null;
    let left = null;
    let transform = '';

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
        console.log(rect);

        switch (position) {
            case '↘':
                top = rect.bottom;
                left = rect.left;
                break;
            case '↙':
                top = rect.bottom;
                left = rect.right;
                transform += 'translateX(-100%)';
                break;
            case '↖':
                top = rect.top;
                left = rect.right;
                transform += 'translate(-100%, -100%)';
                break;
            case '↗':
                top = rect.top;
                left = rect.left;
                transform += 'translateY(-100%)';
                break;
        }
    }

    return [buttonRef, top, left, transform];
}

export default useDropdown;