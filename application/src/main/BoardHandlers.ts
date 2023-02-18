
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

import * as GlobalConfig from "./GlobalConfig";
import { BoardDataPersistence } from '../../../common/persistence/BoardDataPersistence';
import { BoundingBox } from '../../../common/DataTypes/GenericDataTypes';
import { BlockIdAndPosition } from '../../../common/DataTypes/BlockDataTypes';

export function registerBoardHandlers(ipcMain: Electron.IpcMain) {
    ipcMain.handle('board:getBoardData',         (event, boardId) => getBoardData(boardId));
    ipcMain.handle('board:createBlock',          (event, location, parentBlockId) => createBlock(location, parentBlockId));
    ipcMain.handle('board:updateBlockPositions', (event, blocksAndPositions) => updateBlockPositions(blocksAndPositions));
    ipcMain.handle('board:deleteBlocks',         (event, blockIds) => deleteBlocks(blockIds));
}

let persistence: BoardDataPersistence | undefined = undefined;

async function getBoardData(filepath: string) {
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

async function createBlock(location: BoundingBox, parentBlockId: string | undefined) {
    return await persistence?.createBlock(uuidv4(), location, parentBlockId);
}

async function updateBlockPositions(blocksAndPositions: BlockIdAndPosition[]) {
    return await persistence?.updateBlockPositions(blocksAndPositions);
}

async function deleteBlocks(blockIds: string[]) {
    return await persistence?.deleteBlocks(blockIds);
}