
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

import * as GlobalConfig from "./GlobalConfig";
import { BoardDataPersistence } from '../../../common/persistence/BoardDataPersistence';
import { BoundingBox } from '../../../common/DataTypes/GenericDataTypes';

export function registerBoardHandlers(ipcMain: Electron.IpcMain) {
    ipcMain.handle('board:getBoardData', (event, boardId) => getBoardData(boardId));
    ipcMain.handle('board:createBlock', (event, location, parentBlockId) => createBlock(location, parentBlockId));
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