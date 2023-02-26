
import { dialog } from "electron";
import fs from 'fs';
import path from 'path';

import { BoardDataPersistence } from "../../../common/persistence/BoardDataPersistence";
import * as GlobalConfig from "./GlobalConfig";
import * as T from "../../../common/DataTypes/ActionDataTypes";


export function registerProjectHandlers(ipcMain: Electron.IpcMain) {
    ipcMain.handle('project:getRecentBoards',   () => getRecentBoards());
    ipcMain.handle('project:createNewBoard',    () => createNewBoard());
    ipcMain.handle('project:getRemoteProjects', () => getRemoteProjects());
    ipcMain.handle('project:importBoard',       () => importBoard());
}

async function getRecentBoards(): Promise<T.GetBoardsForProjectResponse> {
    return GlobalConfig.config.localBoards.map(filepath => ({
        boardId: filepath,
        boardName: path.basename(filepath, '.mw'),
    }));
}

async function createNewBoard(): Promise<T.CreateNewBoardResponse> {
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
        // Return board data, where ID is filepath and name is filename
        return {
            boardId: filePath,
            boardName: path.basename(filePath, '.mw'),
        };
    }

    return undefined;
}

async function getRemoteProjects(): Promise<T.GetRemoteProjectsResponse> {
    // TODO-const : Load remote server list from a file
    return [];
}

async function importBoard(): Promise<T.ImportBoardResponse> {
    let { canceled, filePaths } = await dialog.showOpenDialog({
        title: "Open Board",
        buttonLabel: "Import",
        filters: [{
            name: 'Spacia Board',
            extensions: ['mw'],
        }],
        properties: [
            'openFile',
            'createDirectory',
        ]
    });

    if (!canceled && filePaths.length > 0) {
        const chosenFile = filePaths[0];
        GlobalConfig.addLocalBoard(chosenFile);
        // Return board data, where ID is filepath and name is filename
        return {
            boardId: chosenFile,
            boardName: path.basename(chosenFile, '.mw'),
        };
    }

    return undefined;
}