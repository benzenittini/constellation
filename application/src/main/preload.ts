
import { contextBridge, ipcRenderer } from 'electron';
import { BoundingBox } from '../../../common/DataTypes/GenericDataTypes';
import { BlockIdAndPosition } from '../../../common/DataTypes/BlockDataTypes';

// NOTE: When adding new bridged items, make sure to update shims-renderer.d.ts with the new properties

contextBridge.exposeInMainWorld('project', {
    getRecentBoards:   () => ipcRenderer.invoke('project:getRecentBoards'),
    createNewBoard:    () => ipcRenderer.invoke('project:createNewBoard'),
    getRemoteProjects: () => ipcRenderer.invoke('project:getRemoteProjects'),
});

contextBridge.exposeInMainWorld('board', {
    getBoardData:         (boardId: string) => ipcRenderer.invoke('board:getBoardData', boardId),
    createBlock:          (location: BoundingBox, parentBlockId: string | undefined) => ipcRenderer.invoke('board:createBlock', location, parentBlockId),
    updateBlockPositions: (blocksAndPositions: BlockIdAndPosition[]) => ipcRenderer.invoke('board:updateBlockPositions', blocksAndPositions),
});
