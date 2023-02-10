
export function registerBoardHandlers(ipcMain: Electron.IpcMain) {
    ipcMain.handle('board:getBoardData', (event, boardId) => getBoardData(boardId));
}

async function getBoardData(boardId: string) {
    console.log("returning board data for " + boardId);
    return {
        boardId,
        blocks: [],
    };
}