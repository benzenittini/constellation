
import { contextBridge, ipcRenderer, shell } from 'electron';
import { AddRemoteProjectRequest, CreateBlockRequest, CreateNewBoardRequest, DeleteBlocksRequest, DeleteBoardRequest, DeleteViewRequest, GetBoardDataRequest, LoadViewRequest, RemoveRemoteProjectRequest, SaveViewRequest, SetBlockContentRequest, SetBlockParentRequest, SetBlockPositionsRequest, SetBlockPriorityRequest, SetClassificationDefinitionsRequest, SetClassificationOnBlocksRequest, SetFieldDefinitionsRequest, SetFieldOnBlocksRequest, SetUserSettingsRequest } from 'constellation-common/datatypes';

// NOTE: When adding new bridged items, make sure to update shims-renderer.d.ts with the new properties

contextBridge.exposeInMainWorld('config', {
    getProjectData:      () => ipcRenderer.invoke('config:getProjectData'),
    getTemplates:        () => ipcRenderer.invoke('config:getTemplates'),
    getPathForNewBoard:  () => ipcRenderer.invoke('config:getPathForNewBoard'),
    createNewBoard:      (req: CreateNewBoardRequest) => ipcRenderer.invoke('config:createNewBoard', req),
    deleteBoard:         (req: DeleteBoardRequest) => ipcRenderer.invoke('config:deleteBoard', req),
    getRemoteProjects:   () => ipcRenderer.invoke('config:getRemoteProjects'),
    addRemoteProject:    (req: AddRemoteProjectRequest) => ipcRenderer.invoke('config:addRemoteProject', req),
    removeRemoteProject: (req: RemoveRemoteProjectRequest) => ipcRenderer.invoke('config:removeRemoteProject', req),
    importBoard:         () => ipcRenderer.invoke('config:importBoard'),
    readFileAsBoard:     () => ipcRenderer.invoke('config:readFileAsBoard'),
    getUserSettings:     () => ipcRenderer.invoke('config:getUserSettings'),
    setUserSettings:     (req: SetUserSettingsRequest) => ipcRenderer.invoke('config:setUserSettings', req),
});

contextBridge.exposeInMainWorld('board', {
    getBoardData:       (req: GetBoardDataRequest) => ipcRenderer.invoke('board:getBoardData', req),

    // -- Blocks --
    createBlock:       (req: CreateBlockRequest)       => ipcRenderer.invoke('board:createBlock', req),
    setBlockPositions: (req: SetBlockPositionsRequest) => ipcRenderer.invoke('board:setBlockPositions', req),
    deleteBlocks:      (req: DeleteBlocksRequest)      => ipcRenderer.invoke('board:deleteBlocks', req),
    setBlockParent:    (req: SetBlockParentRequest)    => ipcRenderer.invoke('board:setBlockParent', req),
    setBlockContent:   (req: SetBlockContentRequest)   => ipcRenderer.invoke('board:setBlockContent', req),
    // -- Fields / Classifications --
    setClassificationDefinitions: (req: SetClassificationDefinitionsRequest) => ipcRenderer.invoke('board:setClassificationDefinitions', req),
    setClassificationOnBlocks:    (req: SetClassificationOnBlocksRequest)    => ipcRenderer.invoke('board:setClassificationOnBlocks', req),
    setFieldDefinitions:          (req: SetFieldDefinitionsRequest)          => ipcRenderer.invoke('board:setFieldDefinitions', req),
    setFieldOnBlocks:             (req: SetFieldOnBlocksRequest)             => ipcRenderer.invoke('board:setFieldOnBlocks', req),
    // -- Views --
    saveView:         (req: SaveViewRequest)         => ipcRenderer.invoke('board:saveView', req),
    deleteView:       (req: DeleteViewRequest)       => ipcRenderer.invoke('board:deleteView', req),
    setBlockPriority: (req: SetBlockPriorityRequest) => ipcRenderer.invoke('board:setBlockPriority', req),
    loadView:         (req: LoadViewRequest)         => ipcRenderer.invoke('board:loadView', req),

    // -- Miscellaneous Things --
    updateSaveStatus:   (callback: any) => ipcRenderer.on('board:updateSaveStatus', callback),
    clearSaveListeners: () => ipcRenderer.removeAllListeners('board:updateSaveStatus'),
});
