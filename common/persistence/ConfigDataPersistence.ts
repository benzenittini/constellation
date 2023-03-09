
import path from 'path';
import fs from 'fs';
import { app } from 'electron';

import { ConfigFile } from '../../common/DataTypes/FileDataTypes';
import { AddRemoteProjectRequest, RemoveRemoteProjectRequest } from '../DataTypes/ActionDataTypes';
import { TemplateClassification } from '../DataTypes/BoardDataTypes';


// ===================
// Config file helpers
// -------------------

const CONFIG_FILE_PATH = path.join(app.getPath('userData'), 'constellation.config');

export const config: ConfigFile = {
    localBoards: [],
    remoteProjects: [],
    boardTemplates: {},
    backups: {},
    // NOTE: When adding things to this list, remember to update "loadConfigFile()" below.
};

function saveConfig() {
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(config));
}

export function loadConfigFile() {
    if (!fs.existsSync(CONFIG_FILE_PATH)) saveConfig();

    let appConfig = JSON.parse(fs.readFileSync(CONFIG_FILE_PATH, 'utf-8'));

    config.localBoards = appConfig.localBoards;
    config.remoteProjects = appConfig.remoteProjects;
    config.boardTemplates = appConfig.boardTemplates;
    config.backups = appConfig.backups;
}


// =======
// Actions
// -------

export function addLocalBoard(boardFilePath: string) {
    config.localBoards.push(boardFilePath);
    saveConfig();
}

export function removeLocalBoard(boardFilePath: string) {
    let index = config.localBoards.indexOf(boardFilePath);
    if (index !== -1) {
        config.localBoards.splice(index, 1);
        saveConfig();
    }
}

export function getRemoteServers() {
    return config.remoteProjects;
}

export function addRemoteServer({ serverUrl, credentials }: AddRemoteProjectRequest) {
    config.remoteProjects.push({ serverUrl, credentials });
    saveConfig();
}

export function removeRemoteServer({ remoteProject }: RemoveRemoteProjectRequest) {
    let index = config.remoteProjects.findIndex(proj => proj.serverUrl === remoteProject.serverUrl && proj.credentials === remoteProject.credentials);
    if (index !== -1) {
        config.remoteProjects.splice(index, 1);
        saveConfig();
    }
}

export function addOrUpdateTemplate(boardId: string, template: TemplateClassification[]) {
    config.boardTemplates[boardId] = template;
    saveConfig();
}

export function deleteTemplate(boardId: string) {
    delete config.boardTemplates[boardId];
    saveConfig();
}