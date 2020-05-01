import React, { useState, useRef, useEffect } from 'react';

const boundary = (v, min, max) => {
    return Math.min(Math.max(v, min), max);
}

const ColorPicker = ({ value, onChange }) => {

    let [gradientBackgroundRef, mousePosition, handleMouseDown] = useMouseDrag(0,0,200,200);

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
                onMouseDown={handleMouseDown}
            ></div>
            <div className="gradient-hue"></div>

        </div>
    )
}

export const useMouseDrag = (minX,minY,maxX,maxY) => {
    let [mousePosition, setMousePosition] = useState([0, 0]);
    let [mouseDown, setMouseDown] = useState(false);
    let gradientBackgroundRef = useRef();

    const getMousePosition = (e) => {
        setMousePosition([
            boundary(e.clientX - gradientBackgroundRef.current.getBoundingClientRect().left, minX, maxX),
            boundary(e.clientY - gradientBackgroundRef.current.getBoundingClientRect().top, minY, maxY)
        ]);
    };

    console.log(mousePosition);
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
    });

    return [gradientBackgroundRef, mousePosition, e => { getMousePosition(e); setMouseDown(true); },mouseDown];
}

export default ColorPicker;