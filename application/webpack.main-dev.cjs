'use strict';

const { merge } = require('webpack-merge');
const common = require('./webpack.main-common.cjs');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
})