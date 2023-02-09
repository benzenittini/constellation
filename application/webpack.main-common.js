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
    },

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
                options: {
                    configFile: "tsconfig-main.json",
                },
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