

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

# Creating the Electron installers
yarn make
```

## Server

```bash
# Building the server
# TODO

# Create the zip file for upload
zip -r -j ./constellation-server.zip ./dist/*
```