const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const merge = require('webpack-merge');

const config = {
    target: 'electron-renderer',
    resolve: {
        extensions: ['.js', '.jsx'],
        alias: {
            '@': path.resolve(__dirname, '../src'),
        }
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
                            hmr: process.env.NODE_ENV === "development"
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
                            hmr: process.env.NODE_ENV === "development"
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
    optimization: {
        splitChunks: {
            cacheGroups: {
                vendor: {
                    chunks: "initial",
                    name: "vendor",
                    test: /[\\/]node_modules[\\/]/,
                }
            }
        },
        runtimeChunk: true
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../src/index.html')
        }),
        new MiniCssExtractPlugin()
    ]
}

module.exports = $ => merge(config, $);
