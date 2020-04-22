const Store = require('electron-store');

const schema = {
    settings: {
        type: "object",
        properties: {
            slateDefaultFontFamily: {
                type: 'string',
            },
            slateDefaultFontSize: {
                type: 'number',
            }
        },
    }
};

const defaults = {
    settings: {
        slateDefaultFontFamily: '微软雅黑',
        slateDefaultFontSize: 12,
    }
}

const store = new Store({ schema, defaults });

export default store;