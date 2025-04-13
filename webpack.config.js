const path = require('path');

module.exports = {
    mode: 'development',
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
                    'style-loader',
                    'css-loader',
                    'sass-loader'
                ],
            },
        ],
    },
    devServer: {
        static: path.resolve(__dirname, 'public',),
        port: 3000,
        open: true,
    },
};
