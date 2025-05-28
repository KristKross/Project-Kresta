const path = require('path');
const dotenv = require('dotenv');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const NodemonPlugin = require('nodemon-webpack-plugin');

dotenv.config();
const MODE = process.env.NODE_ENV || 'development'; 

const defaultHtmlConfig = {
    inject: "body",
    favicon: "./src/assets/favicon-logo.ico",
    minify: true,
};

module.exports = {
    mode: MODE,
    entry: {
        main: "./src/js/main.js",
        index: "./src/js/index.js",
        login: "./src/js/login.js",
        register: "./src/js/register.js",
        dashboard: "./src/js/dashboard.js",
        analytics: "./src/js/analytics.js",
        planner: "./src/js/planner.js",
        tasks: "./src/js/tasks.js",
        notification: "./src/js/notification.js",
        profile: "./src/js/profile.js",
        about: "./src/js/about.js",
        contact: "./src/js/contact.js",
        pricing: "./src/js/pricing.js",
        privacyPolicy: "./src/js/privacyPolicy.js",
    },
    optimization: {
        splitChunks: {
            chunks: 'all',
        },
    },
    output: {
        filename: "js/[name].[contenthash].js",
        path: path.resolve(__dirname, 'dist'), 
        publicPath: '/', 
    },
    plugins: [        
        new HtmlWebpackPlugin({
            ...defaultHtmlConfig,
            filename: 'index.html', 
            template: './src/index.html',
            chunks: ['main', 'index'],
        }),
        new HtmlWebpackPlugin({
            ...defaultHtmlConfig,
            filename: 'login.html',
            template: './src/login.html',
            chunks: ['main', 'login'],
        }),        
        new HtmlWebpackPlugin({
            ...defaultHtmlConfig,
            filename: 'register.html',
            template: './src/register.html',
            chunks: ['main', 'register'],
        }),        
        new HtmlWebpackPlugin({
            ...defaultHtmlConfig,
            filename: 'dashboard.html',
            template: './src/dashboard.html',
            chunks: ['main', 'dashboard'],
        }),    
        new HtmlWebpackPlugin({
            ...defaultHtmlConfig,
            filename: 'analytics.html',
            template: './src/analytics.html',
            chunks: ['main', 'analytics'],
        }),
        new HtmlWebpackPlugin({
            ...defaultHtmlConfig,
            filename: 'planner.html',
            template: './src/planner.html',
            chunks: ['main', 'planner'],
        }),
        new HtmlWebpackPlugin({
            ...defaultHtmlConfig,
            filename: 'tasks.html',
            template: './src/tasks.html',
            chunks: ['main', 'tasks'],
        }),
        new HtmlWebpackPlugin({
            ...defaultHtmlConfig,
            filename: 'notification.html',
            template: './src/notification.html',
            chunks: ['main', 'notification'],
        }),
        new HtmlWebpackPlugin({
            ...defaultHtmlConfig,
            filename: 'profile.html',
            template: './src/profile.html',
            chunks: ['main', 'profile'],
        }),
        new HtmlWebpackPlugin({
            ...defaultHtmlConfig,
            filename: 'creators.html',
            template: './src/creators.html',
            chunks: ['main', 'creators'],
        }),
        new HtmlWebpackPlugin({
            ...defaultHtmlConfig,
            filename: 'about.html',
            template: './src/about.html',
            chunks: ['main', 'about'],
        }),
        new HtmlWebpackPlugin({
            ...defaultHtmlConfig,
            filename: 'contact.html',
            template: './src/contact.html',
            chunks: ['main', 'contact'],
        }),
        new HtmlWebpackPlugin({
            ...defaultHtmlConfig,
            filename: 'pricing.html',
            template: './src/pricing.html',
            chunks: ['main', 'pricing'],
        }),
        new HtmlWebpackPlugin({
            ...defaultHtmlConfig,
            filename: 'privacyPolicy.html',
            template: './src/privacyPolicy.html',
            chunks: ['main', 'privacyPolicy'],
        }),
        new HtmlWebpackPlugin({
            ...defaultHtmlConfig,
            filename: '404.html',
            template: './src/404.html',
            chunks: ['main'],
        }),
        new HtmlWebpackPlugin({
            ...defaultHtmlConfig,
            filename: '403.html',
            template: './src/403.html',
            chunks: ['main'],
        }),
        new HtmlWebpackPlugin({
            ...defaultHtmlConfig,
            filename: '401.html',
            template: './src/401.html',
            chunks: ['main'],
        }),
        ...(MODE === 'production' ? [
            new MiniCssExtractPlugin({
                filename: "css/[name].[contenthash].css",
            }),
        ] : []),
        new NodemonPlugin({
            script: './app.js',
            watch: [
                path.resolve('./controllers'),
                path.resolve('./models'),
                path.resolve('./routes'),
                path.resolve('./utils'),
                path.resolve('./app.js'),
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
            },            {
                test: /\.(png|jpg|jpeg|gif|svg|ico)$/i,
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
        port: 3001,
        open: true,
        historyApiFallback: false,
        watchFiles: [
            './src/**/*.html',
            './src/**/*.scss',
            './src/**/*.js',
        ],
    },
};