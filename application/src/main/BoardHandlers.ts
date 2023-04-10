
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { BrowserWindow } from 'electron';

import * as ConfigDataPersistence from "./ConfigDataPersistence";
import { ConstError, CreateBlockRequest, CreateBlockResponse, DeleteBlocksRequest, DeleteBlocksResponse, DeleteViewRequest, DeleteViewResponse, GetBoardDataRequest, GetBoardDataResponse, LoadViewRequest, LoadViewResponse, SaveViewRequest, SaveViewResponse, SetBlockContentRequest, SetBlockContentResponse, SetBlockParentRequest, SetBlockParentResponse, SetBlockPositionsRequest, SetBlockPositionsResponse, SetBlockPriorityRequest, SetBlockPriorityResponse, SetClassificationDefinitionsRequest, SetClassificationDefinitionsResponse, SetClassificationOnBlocksRequest, SetClassificationOnBlocksResponse, SetFieldDefinitionsRequest, SetFieldDefinitionsResponse, SetFieldOnBlocksRequest, SetFieldOnBlocksResponse } from 'constellation-common/datatypes';
import { BoardDataPersistence } from 'constellation-common/persistence';


export function registerBoardHandlers(ipcMain: Electron.IpcMain) {
    ipcMain.handle('board:getBoardData',      (event, req) => getBoardData(req));
    // -- Blocks --
    ipcMain.handle('board:createBlock',       (event, req) => createBlock(req));
    ipcMain.handle('board:setBlockPositions', (event, req) => setBlockPositions(req));
    ipcMain.handle('board:deleteBlocks',      (event, req) => deleteBlocks(req));
    ipcMain.handle('board:setBlockParent',    (event, req) => setBlockParent(req));
    ipcMain.handle('board:setBlockContent',   (event, req) => setBlockContent(req));
    // -- Fields and Classifications --
    ipcMain.handle('board:setClassificationDefinitions', (event, req) => setClassificationDefinitions(req));
    ipcMain.handle('board:setClassificationOnBlocks',    (event, req) => setClassificationOnBlocks(req));
    ipcMain.handle('board:setFieldDefinitions',          (event, req) => setFieldDefinitions(req));
    ipcMain.handle('board:setFieldOnBlocks',             (event, req) => setFieldOnBlocks(req));
    // -- Views --
    ipcMain.handle('board:saveView',         (event, req) => saveView(req));
    ipcMain.handle('board:deleteView',       (event, req) => deleteView(req));
    ipcMain.handle('board:setBlockPriority', (event, req) => setBlockPriority(req));
    ipcMain.handle('board:loadView',         (event, req) => loadView(req));
}

let persistence: BoardDataPersistence | undefined = undefined;

function getMainWindow() {
    return BrowserWindow.getAllWindows()[0];
}

async function getBoardData({ boardId: filepath }: GetBoardDataRequest): Promise<GetBoardDataResponse> {
    if (fs.existsSync(filepath)) {
        try {
            persistence = new BoardDataPersistence(filepath, undefined, (status) => getMainWindow()?.webContents.send('board:updateSaveStatus', status));
            return persistence.getBoardData();
        } catch(err) {
            return {
                errorCode: 3,
                message: 'Failed to load and parse board data.',
            };
        }
    }

    return {
        errorCode: 4,
        message: 'File was not found.',
    };
}

async function createBlock({ clientId, location, parentBlockId }: CreateBlockRequest): Promise<CreateBlockResponse> {
    try {
        return {
            clientId,
            block: await persistence!.createBlock(uuidv4(), location, parentBlockId),
        };
    } catch(err) {
        const error = ConstError.safeConstructor(err as any);
        return error.getErrorResponse();
    }
}

async function setBlockPositions({ blocksAndPositions }: SetBlockPositionsRequest): Promise<SetBlockPositionsResponse> {
    try {
        return await persistence!.setBlockPositions(blocksAndPositions);
    } catch(err) {
        const error = ConstError.safeConstructor(err as any);
        return error.getErrorResponse();
    }
}

async function deleteBlocks({ blockIds }: DeleteBlocksRequest): Promise<DeleteBlocksResponse> {
    try {
        return {
            blockIds: await persistence!.deleteBlocks(blockIds),
        };
    } catch(err) {
        const error = ConstError.safeConstructor(err as any);
        return error.getErrorResponse();
    }
}

async function setBlockParent({ blockId, parentBlockId }: SetBlockParentRequest): Promise<SetBlockParentResponse> {
    try {
        await persistence!.setBlockParent(blockId, parentBlockId);
        return { blockId, parentBlockId };
    } catch(err) {
        const error = ConstError.safeConstructor(err as any);
        return error.getErrorResponse();
    }
}

async function setBlockContent({ blockId, content }: SetBlockContentRequest): Promise<SetBlockContentResponse> {
    try {
        await persistence!.setBlockContent(blockId, content);
        return { blockId, content };
    } catch(err) {
        const error = ConstError.safeConstructor(err as any);
        return error.getErrorResponse();
    }
}

async function setClassificationDefinitions(req: SetClassificationDefinitionsRequest): Promise<SetClassificationDefinitionsResponse> {
    try {
        let result = await persistence!.setClassificationDefinitions(req);
        let template = persistence!.getBoardTemplate();
        ConfigDataPersistence.addOrUpdateTemplate(persistence!.sourceFile!, template)
        return result;
    } catch(err) {
        const error = ConstError.safeConstructor(err as any);
        return error.getErrorResponse();
    }
}

async function setClassificationOnBlocks(req: SetClassificationOnBlocksRequest): Promise<SetClassificationOnBlocksResponse> {
    try {
        return await persistence!.setClassificationOnBlocks(req);
    } catch(err) {
        const error = ConstError.safeConstructor(err as any);
        return error.getErrorResponse();
    }
}

async function setFieldDefinitions(req: SetFieldDefinitionsRequest): Promise<SetFieldDefinitionsResponse> {
    try {
        return await persistence!.setFieldDefinitions(req);
    } catch(err) {
        const error = ConstError.safeConstructor(err as any);
        return error.getErrorResponse();
    }
}

async function setFieldOnBlocks(req: SetFieldOnBlocksRequest): Promise<SetFieldOnBlocksResponse> {
    try {
        return await persistence!.setFieldOnBlocks(req);
    } catch(err) {
        const error = ConstError.safeConstructor(err as any);
        return error.getErrorResponse();
    }
}

async function saveView(req: SaveViewRequest): Promise<SaveViewResponse> {
    try {
        return await persistence!.saveView(req);
    } catch(err) {
        const error = ConstError.safeConstructor(err as any);
        return error.getErrorResponse();
    }
}

async function deleteView(req: DeleteViewRequest): Promise<DeleteViewResponse> {
    try {
        return await persistence!.deleteView(req);
    } catch(err) {
        const error = ConstError.safeConstructor(err as any);
        return error.getErrorResponse();
    }
}

async function setBlockPriority(req: SetBlockPriorityRequest): Promise<SetBlockPriorityResponse> {
    try {
        return await persistence!.setBlockPriority(req);
    } catch(err) {
        const error = ConstError.safeConstructor(err as any);
        return error.getErrorResponse();
    }
}

async function loadView(req: LoadViewRequest): Promise<LoadViewResponse> {
    try {
        return await persistence!.loadView(req);
    } catch(err) {
        const error = ConstError.safeConstructor(err as any);
        return error.getErrorResponse();
    }
}