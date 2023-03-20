
import { contextBridge, ipcRenderer } from 'electron';
import * as T from '../../../common/DataTypes/ActionDataTypes';

// NOTE: When adding new bridged items, make sure to update shims-renderer.d.ts with the new properties

contextBridge.exposeInMainWorld('config', {
    getProjectData:      () => ipcRenderer.invoke('config:getProjectData'),
    getTemplates:        () => ipcRenderer.invoke('config:getTemplates'),
    getPathForNewBoard:  () => ipcRenderer.invoke('config:getPathForNewBoard'),
    createNewBoard:      (req: T.CreateNewBoardRequest) => ipcRenderer.invoke('config:createNewBoard', req),
    deleteBoard:         (req: T.DeleteBoardRequest) => ipcRenderer.invoke('config:deleteBoard', req),
    getRemoteProjects:   () => ipcRenderer.invoke('config:getRemoteProjects'),
    addRemoteProject:    (req: T.AddRemoteProjectRequest) => ipcRenderer.invoke('config:addRemoteProject', req),
    removeRemoteProject: (req: T.RemoveRemoteProjectRequest) => ipcRenderer.invoke('config:removeRemoteProject', req),
    importBoard:         () => ipcRenderer.invoke('config:importBoard'),
    readFileAsBoard:     () => ipcRenderer.invoke('config:readFileAsBoard'),
});

contextBridge.exposeInMainWorld('board', {
    getBoardData:       (req: T.GetBoardDataRequest) => ipcRenderer.invoke('board:getBoardData', req),
    updateSaveStatus:   (callback: any) => ipcRenderer.on('board:updateSaveStatus', callback),
    clearSaveListeners: () => ipcRenderer.removeAllListeners('board:updateSaveStatus'),

    // -- Blocks --
    createBlock:       (req: T.CreateBlockRequest)       => ipcRenderer.invoke('board:createBlock', req),
    setBlockPositions: (req: T.SetBlockPositionsRequest) => ipcRenderer.invoke('board:setBlockPositions', req),
    deleteBlocks:      (req: T.DeleteBlocksRequest)      => ipcRenderer.invoke('board:deleteBlocks', req),
    setBlockParent:    (req: T.SetBlockParentRequest)    => ipcRenderer.invoke('board:setBlockParent', req),
    setBlockContent:   (req: T.SetBlockContentRequest)   => ipcRenderer.invoke('board:setBlockContent', req),
    // -- Fields / Classifications --
    setClassificationDefinitions: (req: T.SetClassificationDefinitionsRequest) => ipcRenderer.invoke('board:setClassificationDefinitions', req),
    setClassificationOnBlocks:    (req: T.SetClassificationOnBlocksRequest)    => ipcRenderer.invoke('board:setClassificationOnBlocks', req),
    setFieldDefinitions:          (req: T.SetFieldDefinitionsRequest)          => ipcRenderer.invoke('board:setFieldDefinitions', req),
    setFieldOnBlocks:             (req: T.SetFieldOnBlocksRequest)             => ipcRenderer.invoke('board:setFieldOnBlocks', req),
    // -- Views --
    saveView:         (req: T.SaveViewRequest)         => ipcRenderer.invoke('board:saveView', req),
    deleteView:       (req: T.DeleteViewRequest)       => ipcRenderer.invoke('board:deleteView', req),
    setBlockPriority: (req: T.SetBlockPriorityRequest) => ipcRenderer.invoke('board:setBlockPriority', req),
    loadView:         (req: T.LoadViewRequest)         => ipcRenderer.invoke('board:loadView', req),
});
