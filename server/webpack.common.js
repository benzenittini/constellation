
const nodeExternals = require('webpack-node-externals');

const path = require('path');

const DefinePlugin = require('webpack').DefinePlugin;

module.exports = {
    target: 'node',
    externals: [nodeExternals()],

    entry: {
        server: './src/index.ts',
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
    ],

    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
    },
};