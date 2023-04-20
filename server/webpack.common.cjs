
const nodeExternals = require('webpack-node-externals');
const CopyPlugin = require("copy-webpack-plugin");

const path = require('path');

const DefinePlugin = require('webpack').DefinePlugin;

module.exports = {
    target: 'node',
    externals: [nodeExternals({
        allowlist: [
            'constellation-common/utilities',
            'constellation-common/persistence',
            'constellation-common/datatypes',
        ],
    })],

    entry: {
        'constellation-server': './src/index.ts',
        'user-management': './src/user-management.ts',
    },

    module: {
        rules: [
            { test: /\.tsx?$/, loader: 'ts-loader', exclude: /node_modules/ },
        ]
    },

    resolve: {
        extensions: [ '.ts', '.tsx', '.js' ],
    },

    plugins: [
        // See "shims-global.d.ts" for typings of this object.
        new DefinePlugin({
            WEBPACK: {
                APP_VERSION: JSON.stringify(process.env.npm_package_version)
            }
        }),
        new CopyPlugin({
            patterns: [
                "./src/server.properties",
                "./package.json",
                "./package-lock.json",
            ],
        }),
    ],

    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
    },
};