'use strict';

const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const DefinePlugin = require('webpack').DefinePlugin;

module.exports = {
    target: 'web', // TODO-ben : electron-renderer (and/or electron-preload?)

    entry: {
        renderer: './src/ui/renderer.ts',
    },

    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.vue', '.scss'],
        alias: {
            // This is needed because we yarn-linked modal-vue-composer, which brings
            // along it's own node_modules and vue installation that we don't want.
            vue: path.resolve(__dirname, `./node_modules/vue`)
        },
    },

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
                options: {
                    appendTsSuffixTo: [/\.vue$/],
                    configFile: "tsconfig-ui.json",
                },
            },
            {
                test: /\.s?[ac]ss$/i,
                use: ['style-loader', 'css-loader', 'sass-loader'],
            },
            {
                test: /\.vue$/,
                use: 'vue-loader',
            },
        ]
    },

    plugins: [
        new VueLoaderPlugin(),
        new HtmlWebpackPlugin({ template: './src/ui/index.html' }),
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