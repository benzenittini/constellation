
import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';

import * as ProjectHandlers from './ProjectHandlers';
import * as BoardHandlers from './BoardHandlers';

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            // __static is set by webpack and will point to the public directory
            // preload: path.resolve(__static, 'preload.js'),
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    registerProjectHandlers(ipcMain);
    registerBoardHandlers(ipcMain);

    win.webContents.openDevTools();
    win.loadFile('index.html');
};

app.whenReady().then(() => {
    createWindow();

    // Opens a new browser window if app is already running (ex: on Mac)
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// Kill the app on linux/windows when the final window is closed.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

function registerBoardHandlers(ipcMain: Electron.IpcMain) {
    ipcMain.handle('board:getBoardData', (event, boardId) => BoardHandlers.getBoardData(boardId));
}

function registerProjectHandlers(ipcMain: Electron.IpcMain) {
    ipcMain.handle('projects:getProjectsAndBoards', (event, message) => ProjectHandlers.getProjectsAndBoards(message));
}