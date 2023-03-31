
# First-Time Setup

## Prerequisites

* Install git
* Install NodeJS / NPM
* Install Yarn (using `npm install --global yarn` to get version 1)

# Cloning and setting it up

```bash
# =============
# mw-vue-modals
# -------------
git clone ____
cd ./mw-vue-modals
yarn install
yarn build-prod
yarn link

# =============
# mw-vue-notify
# -------------
git clone ____
cd ./mw-vue-notify
yarn install
yarn build-prod
yarn link

# =============
# constellation
# -------------
git clone ____
# common project
cd ./constellation/common
yarn install
# application project
cd ../application
yarn install
yarn link mw-vue-modals
yarn link mw-vue-notify
# server project
cd ../server
yarn install
```

# Development Builds

## Client

```bash
cd ./application

yarn watch-main
yarn watch-ui
yarn start
```

## Server

```bash
cd ./server

yarn watch
yarn serve
```

# Production Builds

## Client

```bash
cd ./application

# Building the code
yarn build-main-prod
yarn build-ui-prod

# Creating the Electron installers, run on the desired OS.
yarn make
# FOR WINDOWS:
# First install .NET 3.5.1 if not already.
# Then, install Wix 3.1.1: https://wixtoolset.org/docs/wix3/
# Then run "yarn make" command.
```

## Server

```bash
# Building the server
# TODO

# Create the zip file for upload
zip -r -j ./constellation-server.zip ./dist/*
```