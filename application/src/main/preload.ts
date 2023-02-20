
import { contextBridge, ipcRenderer } from 'electron';
import * as T from '../../../common/DataTypes/ActionDataTypes';

// NOTE: When adding new bridged items, make sure to update shims-renderer.d.ts with the new properties

contextBridge.exposeInMainWorld('project', {
    getRecentBoards:   () => ipcRenderer.invoke('project:getRecentBoards'),
    createNewBoard:    () => ipcRenderer.invoke('project:createNewBoard'),
    getRemoteProjects: () => ipcRenderer.invoke('project:getRemoteProjects'),
});

contextBridge.exposeInMainWorld('board', {
    getBoardData:      (req: T.GetBoardDataRequest)      => ipcRenderer.invoke('board:getBoardData', req),
    createBlock:       (req: T.CreateBlockRequest)       => ipcRenderer.invoke('board:createBlock', req),
    setBlockPositions: (req: T.SetBlockPositionsRequest) => ipcRenderer.invoke('board:setBlockPositions', req),
    deleteBlocks:      (req: T.DeleteBlocksRequest)      => ipcRenderer.invoke('board:deleteBlocks', req),
    setBlockParent:    (req: T.SetBlockParentRequest)    => ipcRenderer.invoke('board:setBlockParent', req),
    setBlockContent:   (req: T.SetBlockContentRequest)   => ipcRenderer.invoke('board:setBlockContent', req),
});
