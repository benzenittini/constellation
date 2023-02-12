
import fs from 'fs';

import * as GlobalConfig from "./GlobalConfig";

export function registerBoardHandlers(ipcMain: Electron.IpcMain) {
    ipcMain.handle('board:getBoardData', (event, boardId) => getBoardData(boardId));
}

async function getBoardData(filepath: string) {
    if (fs.existsSync(filepath)) {
        try {
            let fileData = fs.readFileSync(filepath, 'utf8');
            return JSON.parse(fileData);
        } catch(err) {
            // TODO-const : Log an error
            GlobalConfig.removeLocalBoard(filepath)
            return undefined;
        }
    }

    GlobalConfig.removeLocalBoard(filepath)
    return undefined;
}