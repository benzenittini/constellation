
import { app, BrowserWindow, ipcMain, screen } from 'electron';
import path from 'path';

import { registerProjectHandlers } from './ProjectHandlers';
import { registerBoardHandlers } from './BoardHandlers';
import { loadConfigFile } from './GlobalConfig';

const createWindow = () => {
    // TODO-const : Remove all "leftMonitor" lines!
    const leftMonitor = screen.getAllDisplays().find((d) => d.bounds.x === 0);
    const win = new BrowserWindow({
        x: leftMonitor?.bounds.x || 0 + 50,
        y: leftMonitor?.bounds.y || 0,
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    registerProjectHandlers(ipcMain);
    registerBoardHandlers(ipcMain);

    win.webContents.openDevTools();
    win.loadFile('index.html');
};

app.whenReady().then(() => {
    loadConfigFile();
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