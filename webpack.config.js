const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const MODE = process.env.NODE_ENV || 'development'; 

module.exports = {
    mode: MODE,
    entry: {
        main: './src/js/main.js',
    },
    output: {
        filename: 'js/[name].bundle.js',
        path: path.resolve(__dirname, 'public'), 
        publicPath: '/', 
    },
    module: {
        rules: [
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
    plugins: [
        ...(MODE === 'production' ? [
            new MiniCssExtractPlugin({
                filename: 'css/[name].css',
            }),
        ] : []),
    ],
    devServer: {
        static: path.resolve(__dirname, 'public'),
        port: 3000,
        open: true,
    },
};
