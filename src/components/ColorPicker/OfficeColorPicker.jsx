import React, { useState, useEffect } from 'react';
import Button from "@/components/Button";
import { SketchPicker, TwitterPicker, ChromePicker } from 'react-color';
import { DropdownButton } from '@/components/DropdownButton';
import { useMouseDrag } from "./ColorPicker";

import './officeColorPicker.scss';
import { TabView } from '../Tabs/Tabs';
import { COLOR_MATRIX_1_HEX, COLOR_MATRIX_2_HEX } from './officeColors';
const _colorGroup = [
    [0, 0, 0],
    [192, 0, 0],
    [255, 0, 0],
    [254, 68, 1],
    [255, 192, 0],
    [255, 255, 0],
    [146, 208, 80],
    [86, 197, 1],
    [0, 176, 80],
    [6, 192, 197],
    [0, 176, 240],
    [0, 112, 192],
    [0, 32, 96],
    [112, 48, 160],
    [255, 64, 196],
    [254, 14, 111],
]

const colorGroup = _colorGroup.map(([r, g, b]) => `rgb(${r},${g},${b})`);

function ColorButton({ active, color, onClick }) {
    return (
        <Button className={`color-item${active ? ' active' : ''}`} onClick={onClick}>
            <div style={{ backgroundColor: color }}></div>
        </Button>
    )
}

const ColorTabVisibleContext = React.createContext(0);

function MoreOfficeColorPickerCore({ views }) {
    let [ref, mousePosition, isMouseDown] = useMouseDrag(0, 0, 300, 10);

    const tempIndex = Math.round(mousePosition[0] / 20);

    return (
        <div className="office-color-picker office-color-picker-2">
            <ColorTabVisibleContext.Provider value={tempIndex}>
                {views}
            </ColorTabVisibleContext.Provider>
            <div
                className="office-color-tab"
                ref={ref}
                style={{ background: "powderblue", display: "flex" }}
            >
                <div className="groups">
                    {colorGroup.map((background, i) => (<div key={i} style={{ background }}></div>))}
                </div>
                <div
                    className="circle"
                    style={{
                        '--circle-left': (isMouseDown ? mousePosition[0] : (tempIndex * 20)) + 'px',
                        '--circle-color': colorGroup[tempIndex]
                    }}
                >
                </div>
            </div>
        </div>
    )
}

export function MoreOfficeColorPicker({ value, onChange }) {
    return (
        <MoreOfficeColorPickerCore
            views={
                <>
                    {COLOR_MATRIX_1_HEX.map((colorGroup, i) => {
                        let buttons = colorGroup.map((hex) => {
                            return (
                                <ColorButton
                                    active={value === hex}
                                    onClick={
                                        _ => onChange(hex)
                                    }
                                    key={hex}
                                    color={hex}
                                />
                            );
                        });

                        return (
                            <ColorTabVisibleContext.Consumer key={i}>
                                {tempIndex => (
                                    <TabView
                                        view={
                                            <div className="color-item-container">
                                                {buttons}
                                            </div>
                                        }
                                        visible={tempIndex === i}
                                        lazy
                                    />
                                )}
                            </ColorTabVisibleContext.Consumer>
                        )
                    })}
                </>
            }
        />
    )
}

export function OfficeColorPicker({ value, onChange }) {
    return (
        <div className="office-color-picker office-color-picker-1">
            {
                COLOR_MATRIX_2_HEX.map((hex, i) => {
                    return (
                        <ColorButton
                            active={value === hex}
                            onClick={
                                _ => onChange(hex)
                            }
                            key={i}
                            color={hex}
                        />
                    );
                })
            }
        </div>
    )
}

// use this script on new tab to pick colors from canvas

// let arr=[];
// document.body.innerHTML = `<canvas id="a" width="800" height="400"></canvas>`;
// document.body.contentEditable=!0;
// document.body.onpaste = e => {
//     function d(img, ctx) {
//         var canvas = ctx.canvas;
//         ctx.clearRect(0, 0, canvas.width, canvas.height);
//         ctx.drawImage(img, 0, 0, img.width, img.height,
//             0, 0, img.width, img.height);
//     }

//     const src = e.clipboardData.files[0]
//     let img = new Image();
//     img.src = URL.createObjectURL(src);
//     img.onload = _ => {
//         d(img, a.getContext('2d'));
//         URL.revokeObjectURL(src);
//     };
// }

// document.body.onclick=((e) => {
//     const x = e.clientX;
//     const y = e.clientY;
//     const ctx = a.getContext('2d')
//     const imageData = ctx.getImageData(x, y, 1, 1);

//     const r = imageData.data[0];
//     const g = imageData.data[1];
//     const b = imageData.data[2];
//     console.log(`PUSH:[${r}, ${g}, ${b}]`);
//     arr.push(`'#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}'`);
// })

// document.body.onkeydown=((e) => {
//     if(e.keyCode === 13){
//         console.log(arr.join(','));
//         arr=[];
//     }
// })

