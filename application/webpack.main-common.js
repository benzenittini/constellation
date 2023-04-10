'use strict';

const path = require('path');

const DefinePlugin = require('webpack').DefinePlugin;

module.exports = {
    target: 'electron-main',

    entry: {
        index: './src/main/index.ts',
        preload: './src/main/preload.ts',
    },

    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
        // This is needed because we npm-installed constellation-commons as a local directory, which adds them as symlinks,
        // which makes it so they can't resolve our node_modules folder, which is required to resolve vue.
        symlinks: false,
    },

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
            },

        ]
    },

    plugins: [
        // See "shims-global.d.ts" for typings of this object.
        new DefinePlugin({
            WEBPACK: {
                APP_VERSION: JSON.stringify(process.env.npm_package_version)
            }
        }),
    ],

    output: {
        path: path.resolve(__dirname, './build'),
    }
};