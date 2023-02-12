
import fs from 'fs';

export function registerBoardHandlers(ipcMain: Electron.IpcMain) {
    ipcMain.handle('board:getBoardData', (event, boardId) => getBoardData(boardId));
}

async function getBoardData(boardId: string) {
    if (fs.existsSync(boardId)) {
        let fileData = fs.readFileSync(boardId, 'utf8');
        return JSON.parse(fileData);
    }

    return undefined;
}