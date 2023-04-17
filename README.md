
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
# =============
# mw-vue-modals
# -------------
git clone git@github.com:moonwafer-io/mw-vue-modals.git
cd ./mw-vue-modals
npm install
npm run build-prod
npm link

# =============
# mw-vue-notify
# -------------
git clone git@github.com:moonwafer-io/mw-vue-notify.git
cd ./mw-vue-notify
npm install
npm run build-prod
npm link

# =============
# constellation
# -------------
git clone git@github.com:benzenittini/constellation.git
# common project
cd ./constellation/common
npm install
# application project
cd ../application
npm install
npm link mw-vue-modals mw-vue-notify
node ./fixTypings.js
# server project
cd ../server
npm install
```

# Development Builds

## Common

```bash
cd ./common

npm run watch
```

## Client

```bash
cd ./application

npm run watch-main
npm run watch-ui
npm run start
```

## Server

```bash
cd ./server

npm run watch
npm run serve
```

# Production Builds

## Common

```bash
cd ./common

npm run build-prod
```

## Client

```bash
cd ./application

# Building the code
npm run build-main-prod
npm run build-ui-prod

# FOR WINDOWS:
# First install .NET 3.5.1 if not already.
# Then, install Wix 3.1.1: https://wixtoolset.org/docs/wix3/
# Then run "npm run make" command.

# Creating the Electron installers, run on the desired OS.
npm run make
```

## Server

```bash
cd ./server

# Building the server
npm run build-prod

# Create the zip file for upload
npm run package-server
```
