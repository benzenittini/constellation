
const fs = require('fs');
const path = require('path');

// Insert "types": "./index.d.ts" into mitt
// See: https://github.com/developit/mitt/issues/178
const mitt = path.resolve('node_modules', 'mitt', 'package.json');
if (fs.existsSync(mitt)) {
    let contents = JSON.parse(fs.readFileSync(mitt, 'utf-8'));
    // contents.exports.types = "./index.d.ts";
    contents["exports"]["types"] = "./index.d.ts";
    fs.writeFileSync(mitt, JSON.stringify(contents, null, 2));
}

// Insert "types": "./types/index.d.ts" into vuex
// See: https://github.com/vuejs/vuex/issues/2213
const vuex = path.resolve('node_modules', 'vuex', 'package.json');
if (fs.existsSync(vuex)) {
    let contents = JSON.parse(fs.readFileSync(vuex, 'utf-8'));
    contents["exports"]["."]["types"] = "./types/index.d.ts";
    fs.writeFileSync(vuex, JSON.stringify(contents, null, 2));
}

// Insert "types": "./types/index.d.ts" into highlight.js
// See: https://github.com/highlightjs/highlight.js/issues/3752
const highlight = path.resolve('node_modules', 'highlight.js', 'package.json');
if (fs.existsSync(highlight)) {
    let contents = JSON.parse(fs.readFileSync(highlight, 'utf-8'));
    contents["exports"]["."]["types"] = "./types/index.d.ts";
    fs.writeFileSync(highlight, JSON.stringify(contents, null, 2));
}