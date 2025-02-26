
import fs from 'fs';
import path from 'path';

import { v4 as uuidv4 } from 'uuid';
import { dialog } from "electron";

import { ArrayUtils, Constants } from 'constellation-common/utilities';
import { LOCAL_PROJECT, LOCAL_PROJECT_NAME, BasicBoardData, GetProjectDataResponse, CreateNewBoardRequest, CreateNewBoardResponse, GetBoardTemplatesResponse, DeleteBoardRequest, DeleteBoardResponse, GetRemoteProjectsResponse, AddRemoteProjectRequest, AddRemoteProjectResponse, RemoveRemoteProjectResponse, RemoveRemoteProjectRequest, ImportBoardResponse, verifyBoardData, ReadFileAsBoardResponse, GetUserSettingsResponse, SetUserSettingsRequest, SetUserSettingsResponse, SaveBoardDataResponse, SaveBoardDataRequest } from 'constellation-common/datatypes';
import { BoardDataPersistence } from 'constellation-common/persistence';
import * as ConfigDataPersistence from "./ConfigDataPersistence";


export function registerConfigHandlers(ipcMain: Electron.IpcMain) {
    ipcMain.handle('config:getProjectData',      () => getProjectData());
    ipcMain.handle('config:getTemplates',        () => getTemplates());
    ipcMain.handle('config:getPathForNewBoard',  () => getPathForNewBoard());
    ipcMain.handle('config:createNewBoard',      (event, req) => createNewBoard(req));
    ipcMain.handle('config:deleteBoard',         (event, req) => deleteBoard(req));
    ipcMain.handle('config:getRemoteProjects',   () => getRemoteProjects());
    ipcMain.handle('config:addRemoteProject',    (event, req) => addRemoteProject(req));
    ipcMain.handle('config:removeRemoteProject', (event, req) => removeRemoteProject(req));
    ipcMain.handle('config:importBoard',         () => importBoard());
    ipcMain.handle('config:readFileAsBoard',     () => readFileAsBoard());
    ipcMain.handle('config:getUserSettings',     () => getUserSettings());
    ipcMain.handle('config:setUserSettings',     (event, req) => setUserSettings(req));
    ipcMain.handle('config:saveBoardData',       (event, req) => saveBoardData(req));
}

async function getProjectData(): Promise<GetProjectDataResponse> {
    let boards = ConfigDataPersistence.config.localBoards.map(filepath => {
        let boardId = filepath;
        let boardName = path.basename(filepath);

        // Trim the extension if able
        let dotIndex = boardName.lastIndexOf('.');
        if (dotIndex !== -1) {
            boardName = boardName.substring(0, boardName.lastIndexOf('.'));
        }

        return { boardId, boardName };
    });

    return {
        projectId: LOCAL_PROJECT,
        projectName: LOCAL_PROJECT_NAME,
        boards: ArrayUtils.mapify<BasicBoardData>(boards, 'boardId'),
    };
}

async function getTemplates(): Promise<GetBoardTemplatesResponse> {
    return Object.keys(ConfigDataPersistence.config.boardTemplates).map(boardId => {
        return {
            projectId: LOCAL_PROJECT,
            projectName: LOCAL_PROJECT_NAME,
            boardId,
            boardName: path.basename(boardId, Constants.DOT_FILE_SUFFIX),
            classifications: ConfigDataPersistence.config.boardTemplates[boardId],
        };
    });
}

async function getPathForNewBoard(): Promise<string | undefined> {
    let { filePath } = await dialog.showSaveDialog({
        title: "Create Board",
        defaultPath: `board.${Constants.FILE_SUFFIX}`,
        buttonLabel: "Create",
        properties: [
            'createDirectory',
            'showOverwriteConfirmation',
        ]
    });

    return filePath;
}

async function createNewBoard({ boardOrFileName, template }: CreateNewBoardRequest): Promise<CreateNewBoardResponse> {
    if (boardOrFileName) {
        // Create new file with initial data
        fs.writeFileSync(boardOrFileName, JSON.stringify(BoardDataPersistence.getInitData(template)));
        ConfigDataPersistence.addLocalBoard(boardOrFileName, uuidv4());
        ConfigDataPersistence.addOrUpdateTemplate(boardOrFileName, template);
        // Return board data, where ID is filepath and name is filename
        return {
            boardId: boardOrFileName,
            boardName: path.basename(boardOrFileName, Constants.DOT_FILE_SUFFIX),
        };
    }

    return {
        errorCode: 3,
        message: "Empty field was provided."
    };
}

async function deleteBoard({ boardId, deleteFile }: DeleteBoardRequest): Promise<DeleteBoardResponse> {
    ConfigDataPersistence.removeLocalBoard(boardId);
    ConfigDataPersistence.deleteTemplate(boardId);

    if (deleteFile && fs.existsSync(boardId)) {
        fs.rmSync(boardId);
    }

    return {
        boardId,
        projectId: LOCAL_PROJECT,
    };
}

async function getRemoteProjects(): Promise<GetRemoteProjectsResponse> {
    return ConfigDataPersistence.getRemoteServers();
}

async function addRemoteProject(req: AddRemoteProjectRequest): Promise<AddRemoteProjectResponse> {
    ConfigDataPersistence.addRemoteServer(req);
    return {};
}

async function removeRemoteProject(req: RemoveRemoteProjectRequest): Promise<RemoveRemoteProjectResponse> {
    ConfigDataPersistence.removeRemoteServer(req);
    return {};
}

async function importBoard(): Promise<ImportBoardResponse> {
    let { canceled, filePaths } = await dialog.showOpenDialog({
        title: "Open Board",
        buttonLabel: "Import",
        filters: [{
            name: 'Constellation Board',
            extensions: [Constants.FILE_SUFFIX],
        },{
            name: 'All Files',
            extensions: ["*"],
        }],
        properties: [
            'openFile',
            'createDirectory',
        ]
    });

    if (!canceled && filePaths.length > 0) {
        try {
            const chosenFile = filePaths[0];
            let alreadyExists = -1 !== ConfigDataPersistence.config.localBoards.indexOf(chosenFile);
            if (alreadyExists) {
                return {
                    errorCode: 6,
                    message: "Board already exists.",
                };
            }

            ConfigDataPersistence.addLocalBoard(chosenFile, uuidv4());

            // Save the imported board's template
            let boardData = JSON.parse(fs.readFileSync(chosenFile, 'utf8'));
            if (!verifyBoardData(boardData)) {
                // Error 5 indicates the file isn't the correct format for BoardData
                return {
                    errorCode: 5,
                    message: 'File is not the correct format.',
                };
            }
            let template = BoardDataPersistence.getBoardTemplate(boardData);
            ConfigDataPersistence.addOrUpdateTemplate(chosenFile, template);

            // Return board data, where ID is filepath and name is filename
            return {
                boardId: chosenFile,
                boardName: path.basename(chosenFile, Constants.DOT_FILE_SUFFIX),
            };
        } catch(err) {
            // Error 4 indicates we failed to parse the file
            return {
                errorCode: 4,
                message: 'Failed to read the provided file.',
            }
        }
    }

    // Error 3 indicates file selection was cancelled.
    return {
        errorCode: 3,
        message: undefined
    };
}

async function readFileAsBoard(): Promise<ReadFileAsBoardResponse> {
    let { canceled, filePaths } = await dialog.showOpenDialog({
        title: "Import Board",
        buttonLabel: "Select",
        filters: [{
            name: 'Constellation Board',
            extensions: [Constants.FILE_SUFFIX],
        },{
            name: 'All Files',
            extensions: ["*"],
        }],
        properties: [
            'openFile',
            'createDirectory',
        ],
    });

    if (!canceled && filePaths.length > 0) {
        try {
            const chosenFile = filePaths[0];
            let boardData = JSON.parse(fs.readFileSync(chosenFile, 'utf8'));

            if (!verifyBoardData(boardData)) {
                // Error 5 indicates the file isn't the correct format for BoardData
                return {
                    errorCode: 5,
                    message: 'File is not the correct format.',
                };
            }

            // Return board data, where ID is filepath and name is filename
            return {
                filepath: chosenFile,
                filename: path.basename(chosenFile, Constants.DOT_FILE_SUFFIX),
                boardData,
            };
        } catch(err) {
            // Error 4 indicates we failed to parse the file
            return {
                errorCode: 4,
                message: 'Failed to read the provided file.',
            }
        }
    }

    // Error 3 indicates file selection was cancelled.
    return {
        errorCode: 3,
        message: undefined
    };
}

async function getUserSettings(): Promise<GetUserSettingsResponse> {
    return ConfigDataPersistence.getUserSettings();
}

async function setUserSettings(req: SetUserSettingsRequest): Promise<SetUserSettingsResponse> {
    ConfigDataPersistence.setUserSettings(req);
    return {};
}

async function saveBoardData(req: SaveBoardDataRequest): Promise<SaveBoardDataResponse> {
    let { filePath } = await dialog.showSaveDialog({
        title: `Download ${req.boardName}`,
        defaultPath: req.boardName + Constants.DOT_FILE_SUFFIX,
        buttonLabel: "Save",
        properties: [
            'createDirectory',
            'showOverwriteConfirmation',
        ]
    });

    if (filePath) {
        fs.writeFileSync(filePath, JSON.stringify(req.boardData, null, 2));
    }

    return {};
}