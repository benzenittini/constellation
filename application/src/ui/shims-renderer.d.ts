
import { AddRemoteProjectRequest, AddRemoteProjectResponse, CreateBlockRequest, CreateBlockResponse, CreateNewBoardRequest, CreateNewBoardResponse, DeleteBlocksRequest, DeleteBlocksResponse, DeleteBoardRequest, DeleteBoardResponse, DeleteViewRequest, DeleteViewResponse, GetBoardDataRequest, GetBoardDataResponse, GetBoardTemplatesResponse, GetProjectDataRequest, GetProjectDataResponse, GetRemoteProjectsRequest, GetRemoteProjectsResponse, GetUserSettingsResponse, ImportBoardRequest, ImportBoardResponse, LoadViewRequest, LoadViewResponse, PasteDataRequest, PasteDataResponse, ReadFileAsBoardResponse, RemoveRemoteProjectRequest, RemoveRemoteProjectResponse, SaveBoardDataRequest, SaveBoardDataResponse, SaveViewRequest, SaveViewResponse, SetBlockContentRequest, SetBlockContentResponse, SetBlockParentRequest, SetBlockParentResponse, SetBlockPositionsRequest, SetBlockPositionsResponse, SetBlockPriorityRequest, SetBlockPriorityResponse, SetClassificationDefinitionsRequest, SetClassificationDefinitionsResponse, SetClassificationOnBlocksRequest, SetClassificationOnBlocksResponse, SetFieldDefinitionsRequest, SetFieldDefinitionsResponse, SetFieldOnBlocksRequest, SetFieldOnBlocksResponse, SetUserSettingsRequest, SetUserSettingsResponse } from 'constellation-common/datatypes';

/** Tells typescript what properties are available on the global "window" object. Useful for preloads. */
declare global {
    interface Window {
        config: {
            getProjectData:      (req: GetProjectDataRequest)      => Promise<GetProjectDataResponse>,
            getTemplates:        () => Promise<GetBoardTemplatesResponse>,
            getPathForNewBoard:  () => Promise<string | undefined>,
            createNewBoard:      (req: CreateNewBoardRequest)      => Promise<CreateNewBoardResponse>,
            deleteBoard:         (req: DeleteBoardRequest)         => Promise<DeleteBoardResponse>,
            getRemoteProjects:   (req: GetRemoteProjectsRequest)   => Promise<GetRemoteProjectsResponse>,
            addRemoteProject:    (req: AddRemoteProjectRequest)    => Promise<AddRemoteProjectResponse>,
            removeRemoteProject: (req: RemoveRemoteProjectRequest) => Promise<RemoveRemoteProjectResponse>,
            importBoard:         (req: ImportBoardRequest)         => Promise<ImportBoardResponse>,
            readFileAsBoard:     () => Promise<ReadFileAsBoardResponse>,
            getUserSettings:     () => Promise<GetUserSettingsResponse>,
            setUserSettings:     (req: SetUserSettingsRequest)     => Promise<SetUserSettingsResponse>,
            saveBoardData:       (req: SaveBoardDataRequest)       => Promise<SaveBoardDataResponse>,
        },
        board: {
            getBoardData: (req: GetBoardDataRequest) => Promise<GetBoardDataResponse>,
            pasteData:    (req: PasteDataRequest)    => Promise<PasteDataResponse>,
            // -- Blocks --
            createBlock:       (req: CreateBlockRequest)       => Promise<CreateBlockResponse>,
            setBlockPositions: (req: SetBlockPositionsRequest) => Promise<SetBlockPositionsResponse>,
            deleteBlocks:      (req: DeleteBlocksRequest)      => Promise<DeleteBlocksResponse>,
            setBlockParent:    (req: SetBlockParentRequest)    => Promise<SetBlockParentResponse>,
            setBlockContent:   (req: SetBlockContentRequest)   => Promise<SetBlockContentResponse>,
            // -- Fields and Classifications --
            setClassificationDefinitions: (req: SetClassificationDefinitionsRequest) => Promise<SetClassificationDefinitionsResponse>,
            setClassificationOnBlocks:    (req: SetClassificationOnBlocksRequest)    => Promise<SetClassificationOnBlocksResponse>,
            setFieldDefinitions:          (req: SetFieldDefinitionsRequest)          => Promise<SetFieldDefinitionsResponse>,
            setFieldOnBlocks:             (req: SetFieldOnBlocksRequest)             => Promise<SetFieldOnBlocksResponse>,
            // -- Views --
            saveView:         (req: SaveViewRequest)         => Promise<SaveViewResponse>,
            deleteView:       (req: DeleteViewRequest)       => Promise<DeleteViewResponse>,
            setBlockPriority: (req: SetBlockPriorityRequest) => Promise<SetBlockPriorityResponse>,
            loadView:         (req: LoadViewRequest)         => Promise<LoadViewResponse>,

            // -- Miscelaneous Things --
            updateSaveStatus:   any,
            clearSaveListeners: any,
        },
    }
}