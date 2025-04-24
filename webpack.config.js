const path = require('path');
const dotenv = require('dotenv');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const NodemonPlugin = require('nodemon-webpack-plugin');

dotenv.config();
const MODE = process.env.NODE_ENV || 'development'; 

module.exports = {
    mode: MODE,
    entry: {
        main: "./src/js/main.js",
        index: "./src/js/index.js",
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
            filename: 'navbar.html',
            template: './src/templates/navbar.html',
            inject: false,
        }),
        new HtmlWebpackPlugin({
            filename: 'index.html', 
            template: './src/index.html',
            inject: 'body',
            chunks: ['main', 'index'],
        }),
        ...(MODE === 'production' ? [
            new MiniCssExtractPlugin({
                filename: "css/[name].[contenthash].css",
            }),
        ] : []),
        new NodemonPlugin({
            script: './app.js',
            watch: [
                path.resolve('./dist'), 
                path.resolve('./app.js')
            ],
            verbose: true,
        }),
    ],
    module: {
        rules: [
            {
                test: /\.html$/,
                loader: 'html-loader',
                options: {
                    sources: {
                        list: [
                            {
                                tag: 'img',
                                attribute: 'src',
                                type: 'src',
                            },
                        ],
                    },
                },
            },
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
                type: 'asset/resource',
                generator: {
                    filename: 'assets/[name].[hash][ext]', 
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
            './src/**/*.html',
            './src/**/*.scss',
            './src/**/*.js',
        ],
    },
};