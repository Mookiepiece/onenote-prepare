import store from '@/store';
import IndexDB from '@/store/indexedDB';
import { v4 as uuid } from 'uuid';
import { useEffect, useState } from 'react';

export const fontSizeOptions = [
    6, 8, 9, 9.5, 10, 10.5, 11, 11.5, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72
]

export const fontFamilyOptions = [
    '微软雅黑',
    '等线',
    '宋体',
    '等线 Light'
]

export const SLATE_DEFAULTS = new Proxy({}, {
    get(target, key) {
        return target[key];
    },
    set(target, key, value) {
        if (key === 'FONT_FAMILY') {
            target[key] = value;
            // not sure whether there's an case that our <html> not finished rendering yet while we modify its style
            document.documentElement.style.setProperty('--slate-default-font-family', `'${value}'`);
            store.set('settings.slateDefaultFontFamily', value);
        } else if (key === 'FONT_SIZE') {
            target[key] = value;
            document.documentElement.style.setProperty('--slate-default-font-size', value + 'pt');
            store.set('settings.slateDefaultFontSize', value);
        } else
            target[key] = value;
        return true;
    }
});
SLATE_DEFAULTS.FONT_FAMILY = store.get('settings.slateDefaultFontFamily');
SLATE_DEFAULTS.FONT_SIZE = store.get('settings.slateDefaultFontSize');

function IdbCacheApiFactory(name) {
    let values = [];
    let listeners = [];

    // #0 init
    IndexDB[name]().then(v => {
        values = v;
        listeners.forEach(callback => callback(values));
    }).catch(e => console.error(e));

    return _ => {
        const [localValue, setLocalValue] = useState(values);

        useEffect(_ => {
            listeners.push(setLocalValue);
            return _ => {
                const index = listeners.indexOf(setLocalValue);
                listeners = [...listeners.slice(0, index), ...listeners.slice(index + 1)];
            }
        }, []);

        const setValue = v => {
            // #0 set value then refresh
            IndexDB[name](v).then(v => {
                values = v;
                listeners.forEach(callback => callback(values));
            }).catch(e => console.error(e));
        }

        return [localValue, setValue];
    }
}
export const useIdbCustomStyles = IdbCacheApiFactory('customStyle');
export const useIdbCustomTableStyles = IdbCacheApiFactory('customTableStyle');
export const useIdbCustomTransforms = IdbCacheApiFactory('customTransform');