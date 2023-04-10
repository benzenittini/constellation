'use strict';

const nodeExternals = require('webpack-node-externals');

const path = require('path');

module.exports = {
    target: 'node',

    externals: [nodeExternals([])],

    entry: './src/index.ts',
    entry: {
        'index': './src/index.ts',
        'persistence': './src/persistence.ts',
    },

    resolve: {
        extensions: [ '.ts', '.tsx', '.js' ],
    },

    module: {
        rules: [
            { test: /\.tsx?$/, loader: 'ts-loader', exclude: /node_modules/ },
        ]
    },

    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
        library: 'constellation-common',
        libraryTarget: 'umd',
        chunkFormat: 'module',
    },
};