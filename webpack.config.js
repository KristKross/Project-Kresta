const path = require('path');
const dotenv = require('dotenv');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

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
        new CopyPlugin({
            patterns: [
                { from: 'src/templates', to: 'templates' },
            ],
        }),
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
            {
                test: /\.(png|jpg|jpeg|gif|svg)$/i,
                use: [
                    'file-loader',
                ],
                type: 'asset/resource',
                generator: {
                    filename: 'images/[name].[hash][ext]', 
                },
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i, 
                type: 'asset/resource', 
                generator: {
                    filename: 'fonts/[name].[hash][ext]', 
                },
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