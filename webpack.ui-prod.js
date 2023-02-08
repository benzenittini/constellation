'use strict';

const { merge } = require('webpack-merge');
const common = require('./webpack.ui-common.js');

module.exports = merge(common, {
    mode: 'production',

    output: {
        filename: '[name].js',
    },
})