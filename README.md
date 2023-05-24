
# Introduction

Welcome! Constellation is an open-source organization tool that combines mind-maps with task tracking capabilities. You can download the application from https://getconstellation.dev, or fork and build your own copy of it from here!

At this point, the project **is not** open to code contributions until I can increase the test coverage to a reasonable number. That said, feature requests, bug reporting, and fresh ideas are always welcome! Feel free to open up a Github issue to send in feedback.

# First-Time Setup

## Prerequisites

* Install git
* Install git-lfs
* Install NodeJS / NPM

# Cloning and setting it up

```bash
git clone git@github.com:benzenittini/constellation.git

# common project
cd ./constellation/common
npm install

# application project
cd ../application
npm install

# server project
cd ../server
npm install
```

# Development Builds

```bash
# Common module
cd ./common
npm run watch

# Application module (client)
cd ./application
npm run watch-main
npm run watch-ui
npm run start

# Server module
cd ./server
npm run watch
npm run serve
```

# Release Process

1. Verify everything is committed to git.
1. Merge `dev` branch into `master`.
1. Run clean builds of all projects:
    ```bash
    # Clean up past builds
    rm -rf ./common/dist ./common/node_modules ./application/build ./application/node_modules ./server/dist ./server/node_modules

    # Build common
    cd ./common
    npm install
    npm run build-prod

    # Build application
    cd ../application
    npm install
    npm run build-main-prod
    npm run build-ui-prod 
    # For first time building on Windows:
    # First install .NET 3.5.1 if not already.
    # Then, install Wix 3.1.1: https://wixtoolset.org/docs/wix3/
    # Then run "npm run make" command.
    npm run make

    # Build server
    cd ../server
    npm install
    npm run build-prod
    npm run package-server
    ```
1. Copy artifacts to server
1. Create and push git tag
    ```bash
    git tag vM.m.p
    git push origin --tags
    ```
1. Update all package.json versions for upcoming version.
1. Create/push new branch for new version development.
1. Update getconstellation.dev's changelog and available versions.
1. Deploy new version of getconstellation.dev