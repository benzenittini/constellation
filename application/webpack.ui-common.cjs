'use strict';

const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');
const DefinePlugin = require('webpack').DefinePlugin;

module.exports = {
    // The "electron-renderer" target is more correct, but it doesn't export "global", which is required by Dragula.
    // Using the "web" target includes it, and works for all our other needs too.
    target: 'web',
    // target: 'electron-renderer',

    entry: {
        renderer: './src/ui/renderer.ts',
    },

    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.vue', '.scss'],
        alias: {
            // This is needed because we npm-linked mw-vue-modals/notify, which brings
            // along it's own node_modules and vue installation that we don't want.
            // The "symlinks: false" solution isn't consistent across platforms.
            vue: path.resolve(__dirname, `./node_modules/vue`)
        },
    },

    module: {
        rules: [
            {
                test: /\.(png|jpe?g|gif)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
                options: {
                    appendTsSuffixTo: [/\.vue$/]
                }
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
        // See "shims-global.d.ts" for typings of this object.
        new DefinePlugin({
            WEBPACK: {
                APP_VERSION: JSON.stringify(process.env.npm_package_version)
            }
        }),
    ],

    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, './build'),
        publicPath: './',
        // For our graphics, configured in the 'asset/resource' module above.
        assetModuleFilename: 'graphics/[hash][ext][query]',
    }
};