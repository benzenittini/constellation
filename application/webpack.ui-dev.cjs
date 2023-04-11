'use strict';

const { merge } = require('webpack-merge');
const common = require('./webpack.ui-common.cjs');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
})