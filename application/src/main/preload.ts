
import { contextBridge, ipcRenderer } from 'electron';

// NOTE: When adding new bridged items, make sure to update shims-renderer.d.ts with the new properties

contextBridge.exposeInMainWorld('projects', {
    getProjectsAndBoards: (message: string) => ipcRenderer.invoke('projects:getProjectsAndBoards', message),
});

contextBridge.exposeInMainWorld('board', {
    getBoardData: (message: string) => ipcRenderer.invoke('board:getBoardData', message),
});
