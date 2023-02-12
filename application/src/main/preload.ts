
import { contextBridge, ipcRenderer } from 'electron';

// NOTE: When adding new bridged items, make sure to update shims-renderer.d.ts with the new properties

contextBridge.exposeInMainWorld('project', {
    getRecentBoards:   () => ipcRenderer.invoke('project:getRecentBoards'),
    createNewBoard:    () => ipcRenderer.invoke('project:createNewBoard'),
    getRemoteProjects: () => ipcRenderer.invoke('project:getRemoteProjects'),
});

contextBridge.exposeInMainWorld('board', {
    getBoardData: (boardId: string) => ipcRenderer.invoke('board:getBoardData', boardId),
});
