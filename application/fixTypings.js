
const fs = require('fs');
const path = require('path');


// Insert "types": "./types/index.d.ts" into vuex
// See: https://github.com/vuejs/vuex/issues/2213
const vuex = path.resolve('node_modules', 'vuex', 'package.json');
if (fs.existsSync(vuex)) {
    let contents = JSON.parse(fs.readFileSync(vuex, 'utf-8'));
    contents["exports"]["."]["types"] = "./types/index.d.ts";
    fs.writeFileSync(vuex, JSON.stringify(contents, null, 2));
}

