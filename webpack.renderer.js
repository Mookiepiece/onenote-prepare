
//modify electron-webpack configs
module.exports = function (config) {
    config.resolve.extensions = [
        '.js',
        '.json',
        '.jsx',
        '.node',
        '.css',
        '.sass',
        '.scss'
    ];

    const sassRules = config.module.rules.filter(rule =>
        rule.test.toString().match(/css|less|s\(\[ac\]\)ss/)
    );
    sassRules.forEach(rule => {
        //remove css-hot-loader
        rule.use = rule.use.filter(use => use !== 'css-hot-loader');

        //add hmr for mini-css-extract-plugin
        rule.use=rule.use.map(use => {
            if (typeof use ==="string" && use.includes('mini-css-extract-plugin')) {
                return {
                    loader:use,
                    options: {
                        hmr: process.env.NODE_ENV==='development'
                    }
                }
            }
            return use;
        })
    });

    config.module.rules.push({
        test: /\.jsx$/,
        exclude: /node_modules/,
        use: {
            loader: 'babel-loader',
            options: {
                presets: ['@babel/react']
            }
        }
    });

    return config;
}