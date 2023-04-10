
import { app, BrowserWindow, ipcMain, screen, shell } from 'electron';
import path from 'path';

import { registerConfigHandlers } from './ConfigHandlers';
import { registerBoardHandlers } from './BoardHandlers';
import { loadConfigFile } from './ConfigDataPersistence';

const createWindow = () => {
    const win = new BrowserWindow({
        width: 1280,
        height: 1024,
        icon: '/path/to/icon.png', // Only needed for linux packaging.
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    });
    win.setMenu(null);

    if (process.env.NODE_ENV !== 'production') {
        win.webContents.openDevTools();
    } else {
        win.maximize();
    }

    win.loadFile('index.html');

    // Open anchor tags in the user's default browser. (Used by MarkdownEditor links.)
    win.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });
};

app.whenReady().then(() => {
    loadConfigFile();
    createWindow();

    registerConfigHandlers(ipcMain);
    registerBoardHandlers(ipcMain);

    // Opens a new browser window if app is already running (ex: on Mac)
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// Kill the app on linux/windows when the final window is closed.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});