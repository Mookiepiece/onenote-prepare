import React, { useState, useRef, useEffect } from 'react';

import './colorPicker.scss';

const boundary = (v, min, max) => {
    return Math.min(Math.max(v, min), max);
}

const ColorPicker = ({ value, onChange }) => {

    let [gradientBackgroundRef, mousePosition] = useMouseDrag(0, 0, 200, 200);

    return (
        <div role="input" className="color-picker">
            <div
                className="gradient-background"
                style={{
                    '--circle-left': mousePosition[0] + 'px',
                    '--circle-top': mousePosition[1] + 'px',
                    '--circle-color': 'red'
                }}
                ref={gradientBackgroundRef}
            ></div>
            <div className="gradient-hue"></div>

        </div>
    )
}

export const useMouseDrag = (minX, minY, maxX, maxY) => {
    let [mousePosition, setMousePosition] = useState([0, 0]);
    let [mouseDown, setMouseDown] = useState(false);
    let ref = useRef();

    const getMousePosition = (e) => {
        setMousePosition([
            boundary(e.clientX - ref.current.getBoundingClientRect().left, minX, maxX),
            boundary(e.clientY - ref.current.getBoundingClientRect().top, minY, maxY)
        ]);
    };

    const removeListener = (e) => {
        document.removeEventListener('mousemove', getMousePosition);
        document.removeEventListener('mouseup', removeListener);
        setMouseDown(false);
    };

    useEffect(_ => {
        if (mouseDown) {
            document.addEventListener('mousemove', getMousePosition);
            document.addEventListener('mouseup', removeListener);
        }
        return _ => {
            document.removeEventListener('mousemove', getMousePosition);
            document.removeEventListener('mouseup', removeListener);
        }
    },[mouseDown]);

    useEffect(_ => {
        ref.current.addEventListener('mousedown', e => { getMousePosition(e); setMouseDown(true); });
    }, []);

    return [ref, mousePosition, mouseDown];
}

export default ColorPicker;