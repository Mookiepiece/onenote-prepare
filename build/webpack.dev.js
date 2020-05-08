const merge = require('./webpack.config');
const path = require('path');

const development = {
    mode: "development",
    devtool: "cheap-module-eval-source-map",
    output: {
        path: path.resolve(__dirname, "../dist"),
        filename: "[name].js",
        chunkFilename: "[name]-chunk.js",
    },
    devServer: {
        historyApiFallback: true,
        disableHostCheck: true,
        overlay: true,
        port: 9001,
        hot: true,
    },
}

module.exports = merge(development);
