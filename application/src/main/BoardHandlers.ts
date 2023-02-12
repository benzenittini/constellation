
import fs from 'fs';

import * as GlobalConfig from "./GlobalConfig";
import { BoardDataPersistence } from '../../../common/persistence/BoardDataPersistence';

export function registerBoardHandlers(ipcMain: Electron.IpcMain) {
    ipcMain.handle('board:getBoardData', (event, boardId) => getBoardData(boardId));
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