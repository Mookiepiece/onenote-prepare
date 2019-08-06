const path=require('path');
const HtmlWebpackPlugin =require('html-webpack-plugin')
module.exports ={
    mode:'development',
    entry:'./src/index.js',
    output:{
        //path:path.resolve(__dirname,'dist/js'),
        //publicPath:'js/',
        filename:'main.js'},
    module:{
        rules:[
            {
                test:/\.css$/,
                use:['style-loader','css-loader']
            },
            {
                test:/\.(jpg|png|svg|gif)$/,
                use:[
                    {
                        loader:'url-loader',
                        options:{limit:8192,}
                    }
                ]
            },
            {
                test:/\.jsx?$/,
                exclude:/node_modules/,
                use:{
                    loader:'babel-loader',
                    options:{
                        presets:['@babel/env','@babel/react'],
                    }
                }
            }
        ]
    },
    devServer:{
        contentBase:'./dist/',
    },
    plugins:[
        new HtmlWebpackPlugin({template:'./src/index.html'})
    ]
}