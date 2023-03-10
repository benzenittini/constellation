
const fs = require('fs');
const path = require('path');

const IGNORED_PATHS = [
  '/out',
  '/node_modules',
  '/.git',
  '/webpack',
  '/yarn.lock',
  '/tsconfig',
  '/forge.config.js',
  '/src',
];

module.exports = {
  hooks: {
    postPackage: async (forgeConfig, options) => {
      // Flatten "./build" into its parent
      const appDir = path.resolve(options.outputPaths[0], 'resources', 'app');
      const buildDir = path.resolve(appDir, 'build');
      fs.cpSync(buildDir, appDir, { recursive: true });
      fs.rmSync(buildDir, { recursive: true });

      // Fix the "main" entrypoint in package.json
      const filepath = path.resolve(appDir, 'package.json');
      let packagejson = JSON.parse(fs.readFileSync(filepath, 'utf8'));
      packagejson.main = 'index.js';
      fs.writeFileSync(filepath, JSON.stringify(packagejson, null, 2));
    }
  },
  packagerConfig: {
    ignore: (path) => {
      if (IGNORED_PATHS.some(p => path.startsWith(p))) {
        return true;
      }
      return false;
    },
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {},
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
};
