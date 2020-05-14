import { useState } from 'react';
import { alt } from './index';

export function useDeepState(info, setInfo, path) {
    const value = path.split('.').reduce((info, key) => info[key], info);
    const setValue = v => setInfo(alt.set(info, path, v));
    return [value, setValue];
}

export function useReState(init) {
    const [value, setValue] = useState(init);
    const resetValue = _ => {
        setValue(init)
    }
    return [value, setValue, resetValue];
}