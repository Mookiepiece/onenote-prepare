import React, { useState } from 'react';
import { SketchPicker } from 'react-color';
import Input from '@/components/Input';

const Settings = _ => {
    const [v, s] = useState("#666");
    return (
        <div>
            <Input
                value={v}
                onChange={v => {
                    s(v);
                }}
            />
        </div>
    );
}

export default Settings;