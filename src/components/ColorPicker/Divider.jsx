import React, { useState, useRef, useEffect } from 'react';
import { useMouseDrag } from "./ColorPicker";
import Button from '@/components/Button';

import './divider.scss';

export const Divider = ({ value, onChange }) => {
    let [ref, mousePosition, isMouseDown] = useMouseDrag(0, 0, 400, 10);

    let v = Math.round(mousePosition[0] / 40);

    const disabledLength = value.length ? value[value.length - 1] + 1 : 0;
    const laDV = value[value.length - 1];
    if (v <= disabledLength) v = disabledLength + 1;

    const position = v * 40;
    let displayV = v - 1;

    return (
        <div>
            {
                disabledLength < 9 ? (
                    <>
                        <div role="input" className="divider">
                            <div className="line"
                                style={{
                                    '--circle-left': position + 'px',
                                    '--number-display': isMouseDown ? '1' : '0',
                                    '--disabled-length': disabledLength * 40 + 'px'
                                }}
                                ref={ref}
                            >

                                <div className="line-disable" ></div>
                                <div className="circle" data-drag-hint={v !== disabledLength + 1 && laDV !== undefined ? laDV + 1 + "-" + displayV : displayV}></div>
                            </div>
                        </div>
                        <Button style={{marginLeft:'24px'}} type="primary" onClick={_ => onChange([...value, displayV])}>打断</Button>
                    </>
                ) : <Button type="primary" onClick={_ => onChange([])}>重选</Button>
            }
            <div className="divider-list-item-container">
                {
                    value.map((dv, i) => {
                        let laDV = value[i - 1]
                        let length = laDV === undefined ? dv + 1 : dv - laDV;
                        let left = laDV === undefined ? 0 : (laDV + 1);

                        return (
                            <div key={i} className="divider-list-item">
                                <span>{i + 1}</span>
                                <span>{length === 1 ? dv : left + '-' + dv}</span>
                                <div style={{
                                    left: left * 40,
                                    width: length * 40,
                                }}></div>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}

