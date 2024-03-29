
import path from 'path';
import fs from 'fs';

import { app } from 'electron';
import { v4 as uuidv4 } from 'uuid';

import { AddRemoteProjectRequest, ConfigFile, RemoveRemoteProjectRequest, TemplateClassification, UserSettings } from 'constellation-common/datatypes';


// ===================
// Config file helpers
// -------------------

const CONFIG_FILE_PATH = path.join(app.getPath('userData'), 'constellation.config');

export const config: ConfigFile = {
    localBoards: [],
    remoteProjects: [],
    boardTemplates: {},
    backups: {},
    userSettings: {
        panSpeed: 1,
        zoomSpeed: 1,
        switchCtrlShiftForSelection: false,
        useShiftToZoom: false,
        invertScrollDirection: false,
    },
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
    if (appConfig.userSettings?.panSpeed)  config.userSettings.panSpeed  = appConfig.userSettings?.panSpeed;
    if (appConfig.userSettings?.zoomSpeed) config.userSettings.zoomSpeed = appConfig.userSettings?.zoomSpeed;
    if (appConfig.userSettings?.switchCtrlShiftForSelection !== undefined) config.userSettings.switchCtrlShiftForSelection = appConfig.userSettings?.switchCtrlShiftForSelection;
    if (appConfig.userSettings?.useShiftToZoom !== undefined)              config.userSettings.useShiftToZoom              = appConfig.userSettings?.useShiftToZoom;
    if (appConfig.userSettings?.invertScrollDirection !== undefined)       config.userSettings.invertScrollDirection       = appConfig.userSettings?.invertScrollDirection;
}


// =======
// Actions
// -------

export function addLocalBoard(boardFilePath: string, backupId: string) {
    config.localBoards.push(boardFilePath);
    config.backups[boardFilePath] = backupId;
    saveConfig();
}

export function removeLocalBoard(boardFilePath: string) {
    let boardIndex = config.localBoards.indexOf(boardFilePath);
    if (boardIndex !== -1) {
        config.localBoards.splice(boardIndex, 1);
        if (config.backups[boardFilePath]) {
            fs.rmSync(
                path.join(app.getPath('userData'), 'backups', config.backups[boardFilePath]),
                { force: true }
            );
            delete config.backups[boardFilePath];
        }
        saveConfig();
    }
}

export function addBackupFile(boardId: string, backupId: string) {
    config.backups[boardId] = backupId;
    saveConfig();
}
export function getBackupId(boardId: string): string {
    if (!config.backups[boardId]) {
        addBackupFile(boardId, uuidv4());
    }
    return config.backups[boardId];
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

export function getUserSettings() {
    return config.userSettings;
}

export function setUserSettings(settings: Partial<UserSettings>) {
    if (settings.panSpeed)  config.userSettings.panSpeed  = settings.panSpeed;
    if (settings.zoomSpeed) config.userSettings.zoomSpeed = settings.zoomSpeed;
    if (settings.switchCtrlShiftForSelection !== undefined)  config.userSettings.switchCtrlShiftForSelection = settings.switchCtrlShiftForSelection;
    if (settings.useShiftToZoom !== undefined)               config.userSettings.useShiftToZoom              = settings.useShiftToZoom;
    if (settings.invertScrollDirection !== undefined)        config.userSettings.invertScrollDirection       = settings.invertScrollDirection;
    saveConfig();
}