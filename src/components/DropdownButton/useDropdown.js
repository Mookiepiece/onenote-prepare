import { useState, useRef, useEffect } from 'react';
import { closest } from '@/components/util';

/**
 * get a relative position for poper
 * @param {*} visible 
 * @param {*} position 
 */
export const usePosition = (position = '↘', inControl = true) => {
    const ref = useRef();
    let top = null;
    let left = null;
    let transform = '';

    if (inControl && ref.current) {
        const rect = ref.current.getBoundingClientRect();

        switch (position) {
            case '↘':
                top = rect.bottom;
                left = rect.left;
                break;
            case '↓':
                top = rect.bottom;
                left = rect.right - rect.width / 2;
                transform += 'translateX(-50%)';
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

    return [ref, top, left, transform];
}

/**
 * 
 * @param {*} panelActive 
 * @param {*} setPanelActive 
 * @param {String} eventName trigger
 */
const useDropdown = (panelActive, setPanelActive, eventName = 'click', position) => {
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

    const [ref, top, left, transform] = usePosition(position);

    return [ref, top, left, transform];
}

export default useDropdown;