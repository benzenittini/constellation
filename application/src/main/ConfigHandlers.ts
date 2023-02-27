
import { dialog } from "electron";
import fs from 'fs';
import path from 'path';

import { BoardDataPersistence } from "../../../common/persistence/BoardDataPersistence";
import * as ConfigDataPersistence from "../../../common/persistence/ConfigDataPersistence";
import * as T from "../../../common/DataTypes/ActionDataTypes";
import { mapify } from "../../../common/utilities/ArrayUtils";
import { BasicBoardData, LOCAL_PROJECT, LOCAL_PROJECT_NAME } from "../../../common/DataTypes/BoardDataTypes";


export function registerConfigHandlers(ipcMain: Electron.IpcMain) {
    ipcMain.handle('config:getProjectData',    () => getProjectData());
    ipcMain.handle('config:createNewBoard',    () => createNewBoard());
    ipcMain.handle('config:getRemoteProjects', () => getRemoteProjects());
    ipcMain.handle('config:importBoard',       () => importBoard());
}

async function getProjectData(): Promise<T.GetProjectDataResponse> {
    let boards = ConfigDataPersistence.config.localBoards.map(filepath => ({
        boardId: filepath,
        boardName: path.basename(filepath, '.mw'),
    }));

    return {
        projectId: LOCAL_PROJECT,
        projectName: LOCAL_PROJECT_NAME,
        boards: mapify<BasicBoardData>(boards, 'boardId'),
    };
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
        ConfigDataPersistence.addLocalBoard(filePath);
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
        ConfigDataPersistence.addLocalBoard(chosenFile);
        // Return board data, where ID is filepath and name is filename
        return {
            boardId: chosenFile,
            boardName: path.basename(chosenFile, '.mw'),
        };
    }

    return undefined;
}