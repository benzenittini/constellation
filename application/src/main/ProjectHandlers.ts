
export function registerProjectHandlers(ipcMain: Electron.IpcMain) {
    ipcMain.handle('projects:getProjectsAndBoards', (event, message) => getProjectsAndBoards(message));
}

async function getProjectsAndBoards(message: string) {
    return "received: " + message;
}