
# First-Time Setup

## Prerequisites

* Install git
* Install NodeJS / NPM

# Cloning and setting it up

```bash
# =============
# mw-vue-modals
# -------------
git clone ____
cd ./mw-vue-modals
npm install
npm run build-prod
npm link

# =============
# mw-vue-notify
# -------------
git clone ____
cd ./mw-vue-notify
npm install
npm run build-prod
npm link

# =============
# constellation
# -------------
git clone ____
# common project
cd ./constellation/common
npm install
# application project
cd ../application
npm install
npm link mw-vue-modals mw-vue-notify
# server project
cd ../server
npm install
```

# Development Builds

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

## Client

```bash
cd ./application

# Building the code
npm run build-main-prod
npm run build-ui-prod

# Creating the Electron installers, run on the desired OS.
npm run make
# FOR WINDOWS:
# First install .NET 3.5.1 if not already.
# Then, install Wix 3.1.1: https://wixtoolset.org/docs/wix3/
# Then run "npm run make" command.
```

## Server

```bash
# Building the server
npm run build-prod

# Create the zip file for upload
zip -r -j ./constellation-server-<VERSION>.zip ./dist/*
```