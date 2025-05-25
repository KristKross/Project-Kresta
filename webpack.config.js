const path = require('path');
const dotenv = require('dotenv');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const NodemonPlugin = require('nodemon-webpack-plugin');

dotenv.config();
const MODE = process.env.NODE_ENV || 'development'; 

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
        sidebar: "./src/js/sidebar.js",
        sidebar: "./src/js/creators.js",
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
            filename: 'templates/navbar.html',
            template: './src/templates/navbar.html',
            inject: false,
            chunks: ['main'],
        }),
        new HtmlWebpackPlugin({
            filename: 'templates/footer.html',
            template: './src/templates/footer.html',
            inject: false,
            chunks: ['main'],
        }),
        new HtmlWebpackPlugin({
            filename: 'templates/sidebar.html',
            template: './src/templates/sidebar.html',
            inject: false,
            chunks: ['main'],
        }),
        new HtmlWebpackPlugin({
            filename: 'index.html', 
            template: './src/index.html',
            inject: 'body',
            chunks: ['main', 'index'],
        }),
        new HtmlWebpackPlugin({
            filename: 'login.html',
            template: './src/login.html',
            inject: 'body',
            chunks: ['main', 'login'],
        }),
        new HtmlWebpackPlugin({
            filename: 'register.html',
            template: './src/register.html',
            inject: 'body',
            chunks: ['main', 'register'],
        }),        
        new HtmlWebpackPlugin({
            filename: 'dashboard.html',
            template: './src/dashboard.html',
            inject: 'body',
            chunks: ['main', 'dashboard'],
        }),    
        new HtmlWebpackPlugin({
            filename: 'analytics.html',
            template: './src/analytics.html',
            inject: 'body',
            chunks: ['main', 'analytics'],
        }),
        new HtmlWebpackPlugin({
            filename: 'planner.html',
            template: './src/planner.html',
            inject: 'body',
            chunks: ['main', 'planner'],
        }),
        new HtmlWebpackPlugin({
            filename: 'tasks.html',
            template: './src/tasks.html',
            inject: 'body',
            chunks: ['main', 'tasks'],
        }),
        new HtmlWebpackPlugin({
            filename: 'notification.html',
            template: './src/notification.html',
            inject: 'body',
            chunks: ['main', 'notification'],
        }),
        new HtmlWebpackPlugin({
            filename: 'profile.html',
            template: './src/profile.html',
            inject: 'body',
            chunks: ['main', 'profile'],
        }),
        new HtmlWebpackPlugin({
            filename: 'creators.html',
            template: './src/creators.html',
            inject: 'body',
            chunks: ['main', 'creators'],
        }),
        new HtmlWebpackPlugin({
            filename: 'about.html',
            template: './src/about.html',
            inject: 'body',
            chunks: ['main', 'about'],
        }),
        new HtmlWebpackPlugin({
            filename: 'contact.html',
            template: './src/contact.html',
            inject: 'body',
            chunks: ['main', 'contact'],
        }),
        new HtmlWebpackPlugin({
            filename: 'pricing.html',
            template: './src/pricing.html',
            inject: 'body',
            chunks: ['main', 'pricing'],
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