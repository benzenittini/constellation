
import { dialog } from "electron";
import fs from 'fs';
import path from 'path';

import { BoardDataPersistence } from "../../../common/persistence/BoardDataPersistence";
import * as ConfigDataPersistence from "../../../common/persistence/ConfigDataPersistence";
import * as T from "../../../common/DataTypes/ActionDataTypes";
import { mapify } from "../../../common/utilities/ArrayUtils";
import { BasicBoardData, LOCAL_PROJECT, LOCAL_PROJECT_NAME } from "../../../common/DataTypes/BoardDataTypes";


export function registerConfigHandlers(ipcMain: Electron.IpcMain) {
    ipcMain.handle('config:getProjectData',      () => getProjectData());
    ipcMain.handle('config:getPathForNewBoard',  () => getPathForNewBoard());
    ipcMain.handle('config:createNewBoard',      (event, req) => createNewBoard(req));
    ipcMain.handle('config:deleteBoard',         (event, req) => deleteBoard(req));
    ipcMain.handle('config:getRemoteProjects',   () => getRemoteProjects());
    ipcMain.handle('config:addRemoteProject',    (event, req) => addRemoteProject(req));
    ipcMain.handle('config:removeRemoteProject', (event, req) => removeRemoteProject(req));
    ipcMain.handle('config:importBoard',         () => importBoard());
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

async function getPathForNewBoard(): Promise<string | undefined> {
    let { filePath } = await dialog.showSaveDialog({
        title: "Create Board",
        defaultPath: 'board.mw',
        buttonLabel: "Create",
        properties: [
            'createDirectory',
            'showOverwriteConfirmation',
        ]
    });

    return filePath;
}

async function createNewBoard({ boardOrFileName, template }: T.CreateNewBoardRequest): Promise<T.CreateNewBoardResponse> {
    if (boardOrFileName) {
        // Create new file with initial data
        fs.writeFileSync(boardOrFileName, JSON.stringify(BoardDataPersistence.getInitData(template)));
        ConfigDataPersistence.addLocalBoard(boardOrFileName);
        // Return board data, where ID is filepath and name is filename
        return {
            boardId: boardOrFileName,
            boardName: path.basename(boardOrFileName, '.mw'),
        };
    }

    return undefined;
}

async function deleteBoard({ boardId, deleteFile }: T.DeleteBoardRequest): Promise<T.DeleteBoardResponse> {
    ConfigDataPersistence.removeLocalBoard(boardId);

    // TODO-const : Also delete this board's backups

    if (deleteFile && fs.existsSync(boardId)) {
        fs.rmSync(boardId);
    }

    return {
        wasSuccessful: true,
        boardId,
        projectId: LOCAL_PROJECT,
    };
}

async function getRemoteProjects(): Promise<T.GetRemoteProjectsResponse> {
    return ConfigDataPersistence.getRemoteServers();
}

async function addRemoteProject(req: T.AddRemoteProjectRequest): Promise<T.AddRemoteProjectResponse> {
    ConfigDataPersistence.addRemoteServer(req);
}

async function removeRemoteProject(req: T.RemoveRemoteProjectRequest): Promise<T.RemoveRemoteProjectResponse> {
    ConfigDataPersistence.removeRemoteServer(req);
}

async function importBoard(): Promise<T.ImportBoardResponse> {
    let { canceled, filePaths } = await dialog.showOpenDialog({
        title: "Open Board",
        buttonLabel: "Import",
        filters: [{
            name: 'Constellation Board',
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