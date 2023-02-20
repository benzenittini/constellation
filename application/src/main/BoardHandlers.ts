
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

import * as GlobalConfig from "./GlobalConfig";
import * as T from '../../../common/DataTypes/ActionDataTypes';

import { BoardDataPersistence } from '../../../common/persistence/BoardDataPersistence';


export function registerBoardHandlers(ipcMain: Electron.IpcMain) {
    ipcMain.handle('board:getBoardData',      (event, req) => getBoardData(req));
    ipcMain.handle('board:createBlock',       (event, req) => createBlock(req));
    ipcMain.handle('board:setBlockPositions', (event, req) => setBlockPositions(req));
    ipcMain.handle('board:deleteBlocks',      (event, req) => deleteBlocks(req));
    ipcMain.handle('board:setBlockParent',    (event, req) => setBlockParent(req));
    ipcMain.handle('board:setBlockContent',   (event, req) => setBlockContent(req));
}

let persistence: BoardDataPersistence | undefined = undefined;

async function getBoardData({ boardId: filepath }: T.GetBoardDataRequest): Promise<T.GetBoardDataResponse> {
    if (fs.existsSync(filepath)) {
        try {
            persistence = new BoardDataPersistence(filepath);
            return persistence.getBoardData();
        } catch(err) {
            // TODO-const : Log an error
            GlobalConfig.removeLocalBoard(filepath)
            return undefined;
        }
    }

    // TODO-const : Log an error
    GlobalConfig.removeLocalBoard(filepath)
    return undefined;
}

async function createBlock({ location, parentBlockId }: T.CreateBlockRequest): Promise<T.CreateBlockResponse> {
    return await persistence!.createBlock(uuidv4(), location, parentBlockId);
}

async function setBlockPositions({ blocksAndPositions }: T.SetBlockPositionsRequest): Promise<T.SetBlockPositionsResponse> {
    return await persistence!.setBlockPositions(blocksAndPositions);
}

async function deleteBlocks({ blockIds }: T.DeleteBlocksRequest): Promise<T.DeleteBlocksResponse> {
    return {
        blockIds: await persistence!.deleteBlocks(blockIds),
    };
}

async function setBlockParent({ blockId, parentBlockId }: T.SetBlockParentRequest): Promise<T.SetBlockParentResponse> {
    await persistence!.setBlockParent(blockId, parentBlockId);
    return { blockId, parentBlockId };
}

async function setBlockContent({ blockId, content }: T.SetBlockContentRequest): Promise<T.SetBlockContentResponse> {
    await persistence!.setBlockContent(blockId, content);
    return { blockId, content };
}