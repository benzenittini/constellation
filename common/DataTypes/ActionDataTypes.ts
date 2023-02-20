
import { Block, BlockContent, BlockIdAndPosition } from "./BlockDataTypes";
import { BasicBoardData, BasicProjectData, BoardData } from "./BoardDataTypes";
import { BoundingBox } from "./GenericDataTypes";

// ================
// Project Requests
// ----------------

export type GetBoardsForProjectRequest = void;
export type GetBoardsForProjectResponse = BasicBoardData[];

// Only remote boards get a name.
export type CreateNewBoardRequest = void | { boardName?: string };
export type CreateNewBoardResponse = BasicBoardData | undefined;

export type GetRemoteProjectsRequest = void;
export type GetRemoteProjectsResponse = BasicProjectData[];


// ==============
// Board Requests
// --------------

export type GetBoardDataRequest  = { boardId: string };
export type GetBoardDataResponse = BoardData | undefined;

export type CreateBlockRequest  = { location: BoundingBox, parentBlockId: string | undefined };
export type CreateBlockResponse = Block | undefined;

export type SetBlockPositionsRequest  = { blocksAndPositions: BlockIdAndPosition[] };
export type SetBlockPositionsResponse = BlockIdAndPosition[];

export type DeleteBlocksRequest  = { blockIds: string[] };
export type DeleteBlocksResponse = { blockIds: string[] };

export type SetBlockParentRequest  = { blockId: string, parentBlockId: string | undefined };
export type SetBlockParentResponse = { blockId: string, parentBlockId: string | undefined };

export type SetBlockContentRequest  = { blockId: string, content: BlockContent };
export type SetBlockContentResponse = { blockId: string, content: BlockContent };