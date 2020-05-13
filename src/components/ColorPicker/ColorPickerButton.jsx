import React,{useState} from 'react';
import Button from "@/components/MkButton";
import { SketchPicker } from 'react-color';
import { DropdownButton, DropdownButtonSelect } from '@/components/DropdownButton';

const ColorPickerButton = ({ disabled, value, onChange }) => {
    const [pickerActive, setPickerActive] = useState(false);

    return (
        <DropdownButton
            active={pickerActive}
            setActive={_ => setPickerActive(_)}

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
                        <div>
                            <SketchPicker
                                color={value}
                                onChange={({ hex }) => {
                                    onChange(hex);
                                }}
                            />
                        </div>
                    )
                }
            }
        />
    )
}

export default ColorPickerButton;