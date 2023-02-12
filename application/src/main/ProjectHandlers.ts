
import { dialog } from "electron";
import fs from 'fs';
import path from 'path';

import { BoardDataPersistence } from "../../../common/persistence/BoardDataPersistence";
import * as GlobalConfig from "./GlobalConfig";


export function registerProjectHandlers(ipcMain: Electron.IpcMain) {
    ipcMain.handle('project:getRecentBoards', () => getRecentBoards());
    ipcMain.handle('project:createNewBoard', () => createNewBoard());
    ipcMain.handle('project:getRemoteProjects', () => getRemoteProjects());
}

async function getRecentBoards() {
    return GlobalConfig.config.localBoards.map(filepath => ({
        boardId: filepath,
        boardName: path.basename(filepath, '.mw'),
    }));
}

async function createNewBoard() {
    let { canceled, filePath } = await dialog.showSaveDialog({
        title: "Create Board",
        defaultPath: 'board.mw',
        buttonLabel: "Create",
        properties: [
            'createDirectory',
            'showOverwriteConfirmation',
        ]
    });

    if (!canceled && filePath) {
        // Create new file with initial data
        fs.writeFileSync(filePath, JSON.stringify(BoardDataPersistence.getInitData()));
        GlobalConfig.addLocalBoard(filePath);
    }

    // Return board data, where ID is filepath and name is filename
    return filePath
        ? ({
            boardId: filePath,
            boardName: path.basename(filePath, '.mw'),
        })
        : undefined;
}

async function getRemoteProjects() {
    // TODO-const : Load remote server list from a file
    return [];
}