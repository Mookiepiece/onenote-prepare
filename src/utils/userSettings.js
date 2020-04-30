import store from '@/store';

export const fontSizeOptions = [
    8, 9, 9.5, 10, 10.5, 11, 11.5, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72
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

export const mockedCustomStyles = [
    {
        title: 'mynode',
        group: 'dd',
        style: {
            bold: false,
            fontColor: '#3cf',
        }
    },
    {
        title: 'msda',
        group: 'asdvv',
        style: {
            fontColor: '#0b6',
            bgColor: '#eff',
            fontFamily: '等线'
        }
    }
]

export const mockedCustomTableStyle = [
    {
        title: 'nb',
        group: 'sasdasd',
        image:'',
        rules: [
            {
                target: ['row', 2, 1],
                cellColor: '#ddd',
                style: {},
            },
            {
                target: ['row', 2, 0],
                cellColor: '#ddd',
                style: {},
            },
            {
                target: ['row', 0, 0],
                cellColor: '#ddd',
                style: {},
            },
        ]
    },
]

export const mockedCustomResultTemplates = [
    {
        title: 'yeah',
        result: [{ children: [{ text: 'nb' }] }]
    }
]