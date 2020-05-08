
const merge = require('./webpack.config');
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const production = {
    mode: "production",
    output: {
        path: path.resolve(__dirname, "../dist"),
        filename: "[name].js",
        chunkFilename: "[name]-chunk.[contenthash:8].js",
    },
    plugins: [
        new CleanWebpackPlugin(),
    ]
}

module.exports = merge(production);
