
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
      // Figure out where we are based on the OS
      const appDir = (options.platform === 'darwin')
        ? path.resolve(options.outputPaths[0], 'constellation.app', 'Contents', 'Resources', 'app')
        : path.resolve(options.outputPaths[0], 'resources', 'app');

      // Flatten "./build" into its parent
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
    icon: './src/ui/graphics/icon',
    ignore: (path) => {
      if (IGNORED_PATHS.some(p => path.startsWith(p))) {
        return true;
      }
      return false;
    },
  },
  rebuildConfig: {},
  makers: [
    // -- Windows --
    {
      name: '@electron-forge/maker-wix',
      config: {
        name: 'Constellation',
        appUserModelId: 'dev.zenittini.constellation.exe',
        icon: './src/ui/graphics/icon.ico',
        manufacturer: 'Constellation',
        ui: {
          chooseDirectory: true,
        },
        beforeCreate: (msiCreator) => {
          msiCreator.wixTemplate = msiCreator.wixTemplate.replace(
            'Name = "{{ApplicationName}} (Machine - MSI)"',
            'Name = "{{ApplicationName}}"'
          );
          msiCreator.wixTemplate = msiCreator.wixTemplate.replace(
            '{{ApplicationName}} (Machine)',
            '{{ApplicationName}}',
          );
        },
      }
    },

    // -- Mac --
    {
      name: '@electron-forge/maker-dmg',
      config: {
        icon: './src/ui/graphics/icon.icns'
      }
    },

    // -- Linux --
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          icon: './src/ui/graphics/icon.png',
        }
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        options: {
          icon: './src/ui/graphics/icon.png'
        },
      },
    },
  ],
};
