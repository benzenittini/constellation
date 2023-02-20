
import * as T from "../../../common/DataTypes/ActionDataTypes";


/** Tells typescript what properties are available on the global "window" object. Useful for preloads. */
declare global {
    interface Window {
        project: {
            getRecentBoards:   (req: T.GetBoardsForProjectRequest) => Promise<T.GetBoardsForProjectResponse>,
            createNewBoard:    (req: T.CreateNewBoardRequest)      => Promise<T.CreateNewBoardResponse>,
            getRemoteProjects: (req: T.GetRemoteProjectsRequest)   => Promise<T.GetRemoteProjectsResponse>,
        },
        board: {
            getBoardData:         (req: T.GetBoardDataRequest)         => Promise<T.GetBoardDataResponse>,
            createBlock:          (req: T.CreateBlockRequest)          => Promise<T.CreateBlockResponse>,
            updateBlockPositions: (req: T.UpdateBlockPositionsRequest) => Promise<T.UpdateBlockPositionsResponse>,
            deleteBlocks:         (req: T.DeleteBlocksRequest)         => Promise<T.DeleteBlocksResponse>,
            setBlockParent:       (req: T.SetBlockParentRequest)       => Promise<T.SetBlockParentResponse>,
            setBlockContent:      (req: T.SetBlockContentRequest)      => Promise<T.SetBlockContentResponse>,
        },
    }
}