
import { app } from 'electron';
import path from 'path';
import fs from 'fs';

const CONFIG_FILE_PATH = path.join(app.getPath('userData'), 'constellation.config')

export const config: {
    localBoards: string[],
    remoteProjects: any[], // TODO-const : properly set the server config data type
} = {
    localBoards: [],
    remoteProjects: [],
};

function saveConfig() {
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(config));
}

export function loadConfigFile() {
    if (!fs.existsSync(CONFIG_FILE_PATH)) saveConfig();

    let appConfig = JSON.parse(fs.readFileSync(CONFIG_FILE_PATH, 'utf-8'));

    config.localBoards = appConfig.localBoards;
    config.remoteProjects = appConfig.remoteProjects;
}

export function addLocalBoard(boardFilePath: string) {
    config.localBoards.push(boardFilePath);
    saveConfig();
}
export function removeLocalBoard(boardFilePath: string) {
    let index = config.localBoards.indexOf(boardFilePath);
    if (index !== -1) {
        config.localBoards.splice(index, 1);
    }
    saveConfig();
}
export function addRemoteServer(/* config? */) {
    throw new Error("GlobalConfig.addRemoteServer not implemented.");
}