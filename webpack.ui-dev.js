'use strict';

const { merge } = require('webpack-merge');
const common = require('./webpack.ui-common.js');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',

    output: {
        filename: '[name].js',
    },
})