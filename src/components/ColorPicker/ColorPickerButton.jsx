import React, { useState } from 'react';
import Button from "@/components/Button";
import { SketchPicker, TwitterPicker, ChromePicker } from 'react-color';
import { DropdownButton } from '@/components/DropdownButton';
import { Tabs, MoreOfficeColorPicker, OfficeColorPicker } from '..';

import './colorPickerButton.scss';

export default ({ disabled, value, onChange }) => {
    const [pickerActive, setPickerActive] = useState(false);

    return (
        <DropdownButton
            active={pickerActive}
            setActive={_ => setPickerActive(_)}
            dropdownWidth={null}
            dropdownHeight={null}

            renderButton={
                (buttonRef) => {
                    return (
                        <Button
                            disabled={disabled}
                            className={`color-picker-button${pickerActive ? " __dropdown" : ""}`}
                            active={pickerActive}
                            onMouseDown={event => {
                                event.preventDefault();
                                if (!disabled) {
                                    setPickerActive(!pickerActive);
                                }
                            }}
                            ref={buttonRef}
                        >
                            <div style={{ background: value }}></div>
                        </Button>
                    )
                }
            }

            renderDropdown={
                (setPickerActive) => {
                    return (
                        <ColorPickerTabs value={value} onChange={onChange} />
                    )
                }
            }
        />
    )
}

export function ColorPickerTabs({ value, onChange }) {
    return (
        <Tabs
            onlyone
            panels={
                [
                    [-1, "yes", (
                        <OfficeColorPicker value={value} onChange={onChange} />
                    )],
                    [0, "额外", (
                        <MoreOfficeColorPicker value={value} onChange={onChange} />
                    )],
                    [1, "RGB", (
                        <ChromePicker
                            disableAlpha
                            color={value}
                            onChange={({ hex }) => {
                                onChange(hex);
                            }}
                        />
                    )],
                ]
            }
        />
    )
}