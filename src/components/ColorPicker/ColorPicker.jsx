import React, { useState, useRef, useEffect } from 'react';
import { ConsoleSqlOutlined } from '@ant-design/icons';

const boundary = (v, min, max) => {
    if (v < min) return min;
    else if (v > max) return max;
    return v;
}

const ColorPicker = ({ value, onChange }) => {

    let [mousePosition, setMousePosition] = useState([0, 0]);
    let [mouseDown, setMouseDown] = useState(false);

    const getMousePosition = (e) => {
        setMousePosition([
            boundary(e.clientX - gradientBackgroundRef.current.getBoundingClientRect().left, 0, 200),
            boundary(e.clientY - gradientBackgroundRef.current.getBoundingClientRect().top, 0, 200)
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
    });

    console.log(mousePosition)

    let gradientBackgroundRef = useRef();

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
                onMouseDown={e => { getMousePosition(e); setMouseDown(true) }}
            ></div>
            <div className="gradient-hue"></div>

        </div>
    )
}

export default ColorPicker;