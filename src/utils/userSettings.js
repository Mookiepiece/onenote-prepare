export const fontSizeOptions = [
    8, 9, 9.5, 10, 10.5, 11, 11.5, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72
]

export const fontFamilyOptions = [
    '微软雅黑',
    '等线',
    '宋体',
    '等线 Light'
]

export const DEAFULT_FONT_FAMILY = "等线 Light";
export const DEAFULT_FONT_SIZE = 12;

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
    {
        target:[2,1],
        type:'row',
        style:'#ddffcc',
        priority: 1
    },
    {
        target:[2,0],
        type:'row',
        style:'#dd99ff',
        priority: 1
    },
    {
        target:[0,0],
        type:'row',
        style:'#dd99ff',
        priority: 1
    },
]