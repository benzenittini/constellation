'use strict';

const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const DefinePlugin = require('webpack').DefinePlugin;

module.exports = {
    target: 'electron-main',

    entry: {
        index: './src/main/index.ts',
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
        // new CopyWebpackPlugin({
        //     patterns: [
        //         { from: '../graphics/finals', to: './graphics' },
        //         { from: '../release-notes', to: './release-notes' },
        //     ]
        // }),
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