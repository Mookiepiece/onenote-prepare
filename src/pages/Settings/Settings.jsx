import React, { useState } from 'react';
import { SketchPicker } from 'react-color';
import Input from '@/components/Input';
import { SLATE_DEFAULTS, fontFamilyOptions, fontSizeOptions } from '@/utils/userSettings';
import { DropdownButtonSelect } from '@/components/DropdownButton';

const Settings = _ => {
    const [v, s] = useState("#666");

    const [slateFontFamily, _setSlateFontFamily] = useState(SLATE_DEFAULTS.FONT_FAMILY);
    const setSlateFontFamily = v => { _setSlateFontFamily(v); SLATE_DEFAULTS.FONT_FAMILY = v; };
    const [slateFontSize, _setSlateFontSize] = useState(SLATE_DEFAULTS.FONT_SIZE);
    const setSlateFontSize = v => { _setSlateFontSize(v); SLATE_DEFAULTS.FONT_SIZE = v; };

    return (
        <div>
            <Input
                value={v}
                onChange={v => {
                    s(v);
                }}
            />
            <div className="form-like">
                <span>默认字体</span>
                <div>
                    <DropdownButtonSelect
                        value={slateFontFamily}
                        width={120}
                        renderLabel={({ value, label }) => (<span style={{ fontFamily: value }}>{label}</span>)}
                        options={
                            fontFamilyOptions.map(v => {
                                return {
                                    label: SLATE_DEFAULTS.FONT_FAMILY === v ? v + ' (默认)' : v,
                                    value: v
                                };
                            })
                        }
                        onChange={setSlateFontFamily}
                    />
                </div>
                <span>默认字号</span>
                <div>
                    <DropdownButtonSelect
                        value={slateFontSize}
                        width={120}
                        renderLabel={({ value, label }) => (<span style={{ fontSize: value }}>{label}</span>)}
                        options={
                            fontSizeOptions.map(v => {
                                return {
                                    label: SLATE_DEFAULTS.FONT_SIZE === v ? v + ' (默认)' : v,
                                    value: v
                                };
                            })
                        }
                        onChange={setSlateFontSize}
                    />
                </div>
            </div>
        </div>
    );
}

export default Settings;