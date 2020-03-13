const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    mode: "development",
    devtool: "cheap-module-eval-source-map",
    target:'electron-renderer',
    output: {
        // path: path.resolve(__dirname, "../dist"),
        // filename: "js/[name]/[name]-bundle.js",
        // chunkFilename: "js/[name]/[name]-bundle.js",
    },
    resolve: {
        extensions: ['.js', '.jsx'], // 默认后缀名
        alias: {
            '@': path.resolve(__dirname, '../src'), // 别名
        }
    },
    devServer: {
        historyApiFallback: true,
        disableHostCheck: true,
        overlay: true,
        port: 9001,
        hot: true,
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: "babel-loader",
                options: {
                    presets: ["@babel/preset-react"],
                    plugins: ["react-hot-loader/babel"]
                }
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            hmr: process.env.NODE_ENV===true
                        }
                    },
                    'css-loader',
                ],
            },
            {
                test: /\.(scss|sass)$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            hmr: process.env.NODE_ENV===true
                        }
                    },
                    'css-loader',
                    'sass-loader',
                ],
            },
            {
                test: /\.(png|jpe?g|gif)$/i,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 1024 * 8,
                            name: '[name].[hash:7].[ext]',
                            outputPath: "images",
                        },
                    },
                ],
            },
            {
                test: /\.(ttf|eot|svg|woff2?)$/,
                loader: "file-loader",
                options: {
                    name: '[name].[hash:7].[ext]',
                    outputPath: "fonts",
                },
            },
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../src/index.html')
        }),
        new MiniCssExtractPlugin()
    ]
}