import React, { useState } from 'react';
import { SketchPicker } from 'react-color';

const Settings = () => {
    const [v, s] = useState("#666");
    return (
        <div>
            <SketchPicker
                color={v}
                onChange={v => {
                    s(v.hex);
                }}
            />
        </div>
    );
}

export default Settings;