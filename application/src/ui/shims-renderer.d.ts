
import * as T from "../../../common/DataTypes/ActionDataTypes";


/** Tells typescript what properties are available on the global "window" object. Useful for preloads. */
declare global {
    interface Window {
        config: {
            getRecentBoards:   (req: T.GetBoardsForProjectRequest) => Promise<T.GetBoardsForProjectResponse>,
            createNewBoard:    (req: T.CreateNewBoardRequest)      => Promise<T.CreateNewBoardResponse>,
            getRemoteProjects: (req: T.GetRemoteProjectsRequest)   => Promise<T.GetRemoteProjectsResponse>,
            importBoard:       (req: T.ImportBoardRequest)         => Promise<T.ImportBoardResponse>,
        },
        board: {
            getBoardData:       (req: T.GetBoardDataRequest) => Promise<T.GetBoardDataResponse>,
            updateSaveStatus:   any,
            clearSaveListeners: any,
            // -- Blocks --
            createBlock:       (req: T.CreateBlockRequest)       => Promise<T.CreateBlockResponse>,
            setBlockPositions: (req: T.SetBlockPositionsRequest) => Promise<T.SetBlockPositionsResponse>,
            deleteBlocks:      (req: T.DeleteBlocksRequest)      => Promise<T.DeleteBlocksResponse>,
            setBlockParent:    (req: T.SetBlockParentRequest)    => Promise<T.SetBlockParentResponse>,
            setBlockContent:   (req: T.SetBlockContentRequest)   => Promise<T.SetBlockContentResponse>,
            // -- Fields and Classifications --
            setClassificationDefinitions: (req: T.SetClassificationDefinitionsRequest) => Promise<T.SetClassificationDefinitionsResponse>,
            setClassificationOnBlocks:    (req: T.SetClassificationOnBlocksRequest)    => Promise<T.SetClassificationOnBlocksResponse>,
            setFieldDefinitions:          (req: T.SetFieldDefinitionsRequest)          => Promise<T.SetFieldDefinitionsResponse>,
            setFieldOnBlocks:             (req: T.SetFieldOnBlocksRequest)             => Promise<T.SetFieldOnBlocksResponse>,
            // -- Views --
            saveView:         (req: T.SaveViewRequest)         => Promise<T.SaveViewResponse>,
            deleteView:       (req: T.DeleteViewRequest)       => Promise<T.DeleteViewResponse>,
            setBlockPriority: (req: T.SetBlockPriorityRequest) => Promise<T.SetBlockPriorityResponse>,
            loadView:         (req: T.LoadViewRequest)         => Promise<T.LoadViewResponse>,
        },
    }
}