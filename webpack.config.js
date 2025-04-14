const path = require('path');
const dotenv = require('dotenv');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

dotenv.config();
const MODE = process.env.NODE_ENV || 'development'; 

module.exports = {
    mode: MODE,
    entry: {
        main: "./src/js/main.js",
    },
    output: {
        filename: "js/[name].[contenthash].js",
        path: path.resolve(__dirname, 'dist'), 
        publicPath: '/', 
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html', 
            template: './src/index.html',
            inject: 'body',
            chunks: ['main'],
        }),
        ...(MODE === 'production' ? [
            new MiniCssExtractPlugin({
                filename: "css/[name].[contenthash].css",
            }),
        ] : []),
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    MODE === 'production' ? MiniCssExtractPlugin.loader : 'style-loader', 
                    'css-loader',
                ],
            },
            {
                test: /\.scss$/,
                use: [
                    MODE === 'production' ? MiniCssExtractPlugin.loader : 'style-loader', 
                    'css-loader', 
                    'sass-loader', 
                ],
            },
        ],
    },
    devServer: {
        static: path.resolve(__dirname, 'dist'),
        port: 3000,
        open: true,
        historyApiFallback: true,
        watchFiles: [
            './src/**/*.html'
        ],
    },
};