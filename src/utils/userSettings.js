export const fontSizeOptions = [
    8, 9, 9.5, 10, 10.5, 11, 11.5, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72
]

export const fontFamilyOptions = [
    '微软雅黑',
    '等线',
    '宋体',
    '等线 Light'
]

const _SLATE_DEFAULTS = {
    FONT_FAMILY: null,
    FONT_SIZE: null,
}

export const SLATE_DEFAULTS = new Proxy(_SLATE_DEFAULTS, {
    get(target, key) {
        return target[key];
    },
    set(target, key, value) {
        if (key === 'FONT_FAMILY') {
            target[key] = value;
            document.documentElement.style.setProperty('--slate-default-font-family', `'${value}'`);
        } else if (key === 'FONT_SIZE') {
            target[key] = value;
            document.documentElement.style.setProperty('--slate-default-font-size', value + 'pt');
        } else
            target[key] = value;
        return true;
    }
});
SLATE_DEFAULTS.init = () => {
    SLATE_DEFAULTS.FONT_FAMILY = '微软雅黑';
    SLATE_DEFAULTS.FONT_SIZE = 12;
}

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

export const mockedCustomTableBackground = [
    [
        {
            target: [2, 1],
            type: 'row',
            style: '#ddffcc',
            priority: 1
        },
        {
            target: [2, 0],
            type: 'row',
            style: '#dd99ff',
            priority: 1
        },
        {
            target: [0, 0],
            type: 'row',
            style: '#99ddff',
            priority: 1
        },
    ],
]