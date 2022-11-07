"use strict";
const path = require('path');
const NodemonPlugin = require('nodemon-webpack-plugin');
module.exports = {
    entry: './src/index.ts',
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    target: 'node',
    resolve: {
        extensions: ['.ts', '.js'],
    },
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'build'),
    },
    devServer: {
        filename: 'index.js',
        static: path.join(__dirname, "build"),
        compress: true,
        port: 4000,
    },
    plugins: [
        new NodemonPlugin({
            script: './build/index.js',
        }),
    ],
};
//# sourceMappingURL=webpack.config.js.map